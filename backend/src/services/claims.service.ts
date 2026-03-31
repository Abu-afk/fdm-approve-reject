import prisma from '../lib/prisma';
import { ClaimStatus } from '@prisma/client';

const CLAIM_INCLUDE = {
  items: { include: { receipts: true } },
  decisions: {
    include: { manager: { select: { fullName: true } } },
    orderBy: { decidedAt: 'desc' as const },
  },
  auditLogs: { orderBy: { timestamp: 'desc' as const } },
};

export async function getEmployeeClaims(employeeId: string) {
  return prisma.expenseClaim.findMany({
    where: { employeeId },
    include: { items: { include: { receipts: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createClaim(
  employeeId: string,
  data: { currency?: string; employeeComment?: string }
) {
  return prisma.expenseClaim.create({
    data: {
      employeeId,
      currency: data.currency || 'GBP',
      employeeComment: data.employeeComment,
    },
  });
}

export async function getClaimById(claimId: string, employeeId: string) {
  const claim = await prisma.expenseClaim.findFirst({
    where: { claimId, employeeId },
    include: CLAIM_INCLUDE,
  });
  if (!claim) throw new Error('Claim not found');
  return claim;
}

export async function updateClaim(
  claimId: string,
  employeeId: string,
  data: { employeeComment?: string; currency?: string }
) {
  const claim = await prisma.expenseClaim.findFirst({ where: { claimId, employeeId } });
  if (!claim) throw new Error('Claim not found');
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(claim.status)) {
    throw new Error('Cannot edit a claim in its current status');
  }
  return prisma.expenseClaim.update({
    where: { claimId },
    data: { employeeComment: data.employeeComment, currency: data.currency },
  });
}

export async function submitClaim(claimId: string, employeeId: string) {
  const claim = await prisma.expenseClaim.findFirst({
    where: { claimId, employeeId },
    include: { items: { include: { receipts: true } } },
  });
  if (!claim) throw new Error('Claim not found');
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(claim.status)) {
    throw new Error('Cannot submit a claim in its current status');
  }
  if (claim.items.length === 0) {
    throw new Error('Claim must have at least one expense item before submission');
  }
  const itemWithoutReceipt = claim.items.find((item) => item.receipts.length === 0);
  if (itemWithoutReceipt) {
    throw new Error(`Expense item "${itemWithoutReceipt.description}" is missing a receipt`);
  }

  const total = claim.items.reduce((sum, item) => sum + item.amount, 0);
  const oldStatus = claim.status;

  return prisma.$transaction([
    prisma.expenseClaim.update({
      where: { claimId },
      data: { status: 'SUBMITTED', submittedAt: new Date(), totalAmount: total },
    }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'SUBMITTED',
        oldStatus: oldStatus as ClaimStatus,
        newStatus: 'SUBMITTED',
        actorId: employeeId,
      },
    }),
  ]);
}

export async function withdrawClaim(claimId: string, employeeId: string) {
  const claim = await prisma.expenseClaim.findFirst({ where: { claimId, employeeId } });
  if (!claim) throw new Error('Claim not found');
  if (!['SUBMITTED', 'CHANGES_REQUESTED', 'DRAFT'].includes(claim.status)) {
    throw new Error('Cannot withdraw a claim in its current status');
  }
  if (claim.status === 'APPROVED' || claim.status === 'PAID') {
    throw new Error('Cannot withdraw an approved or paid claim');
  }

  return prisma.$transaction([
    prisma.expenseClaim.update({ where: { claimId }, data: { status: 'WITHDRAWN' } }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'WITHDRAWN',
        oldStatus: claim.status as ClaimStatus,
        newStatus: 'WITHDRAWN',
        actorId: employeeId,
      },
    }),
  ]);
}

export async function deleteClaim(claimId: string, employeeId: string) {
  const claim = await prisma.expenseClaim.findFirst({ where: { claimId, employeeId } });
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'DRAFT') throw new Error('Only draft claims can be deleted');
  return prisma.expenseClaim.delete({ where: { claimId } });
}

export async function addItem(
  claimId: string,
  employeeId: string,
  data: {
    dateIncurred: string;
    category: string;
    description: string;
    amount: number;
    currency?: string;
    vatAmount?: number;
    merchant: string;
  }
) {
  const claim = await prisma.expenseClaim.findFirst({ where: { claimId, employeeId } });
  if (!claim) throw new Error('Claim not found');
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(claim.status)) {
    throw new Error('Cannot add items to a claim in its current status');
  }
  return prisma.expenseItem.create({
    data: {
      claimId,
      dateIncurred: new Date(data.dateIncurred),
      category: data.category,
      description: data.description,
      amount: Number(data.amount),
      currency: data.currency || 'GBP',
      vatAmount: Number(data.vatAmount || 0),
      merchant: data.merchant,
    },
  });
}

export async function updateItem(
  itemId: string,
  employeeId: string,
  data: Partial<{
    dateIncurred: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    vatAmount: number;
    merchant: string;
  }>
) {
  const item = await prisma.expenseItem.findFirst({
    where: { itemId },
    include: { claim: true },
  });
  if (!item || item.claim.employeeId !== employeeId) throw new Error('Item not found');
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(item.claim.status)) {
    throw new Error('Cannot edit items in this claim status');
  }
  return prisma.expenseItem.update({
    where: { itemId },
    data: {
      dateIncurred: data.dateIncurred ? new Date(data.dateIncurred) : undefined,
      category: data.category,
      description: data.description,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      currency: data.currency,
      vatAmount: data.vatAmount !== undefined ? Number(data.vatAmount) : undefined,
      merchant: data.merchant,
    },
  });
}

export async function deleteItem(itemId: string, employeeId: string) {
  const item = await prisma.expenseItem.findFirst({
    where: { itemId },
    include: { claim: true },
  });
  if (!item || item.claim.employeeId !== employeeId) throw new Error('Item not found');
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(item.claim.status)) {
    throw new Error('Cannot delete items in this claim status');
  }
  return prisma.expenseItem.delete({ where: { itemId } });
}
