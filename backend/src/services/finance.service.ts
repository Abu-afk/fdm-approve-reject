import prisma from '../lib/prisma';
import { ClaimStatus } from '@prisma/client';

export async function getApprovedClaims() {
  return prisma.expenseClaim.findMany({
    where: { status: 'APPROVED' },
    include: {
      employee: { select: { fullName: true, email: true, costCentre: true } },
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getClaimForProcessing(claimId: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { claimId },
    include: {
      employee: { select: { fullName: true, email: true, costCentre: true } },
      items: { include: { receipts: true } },
      decisions: {
        include: { manager: { select: { fullName: true } } },
        orderBy: { decidedAt: 'desc' as const },
      },
      reimbursement: true,
      auditLogs: { orderBy: { timestamp: 'desc' as const } },
    },
  });
  if (!claim) throw new Error('Claim not found');
  return claim;
}

export async function processReimbursement(
  claimId: string,
  financeOfficerId: string,
  data: { paymentReference?: string; financeComment?: string }
) {
  const claim = await prisma.expenseClaim.findUnique({ where: { claimId } });
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'APPROVED') {
    throw new Error('Only approved claims can be processed for reimbursement');
  }

  return prisma.$transaction([
    prisma.reimbursement.create({
      data: {
        claimId,
        financeOfficerId,
        amountPaid: claim.totalAmount,
        currency: claim.currency,
        paymentReference: data.paymentReference,
        paidAt: new Date(),
      },
    }),
    prisma.expenseClaim.update({
      where: { claimId },
      data: { status: 'PAID', financeComment: data.financeComment },
    }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'PAID',
        oldStatus: 'APPROVED' as ClaimStatus,
        newStatus: 'PAID' as ClaimStatus,
        actorId: financeOfficerId,
        comment: data.financeComment,
      },
    }),
  ]);
}
