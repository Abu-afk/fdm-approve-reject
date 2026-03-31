import prisma from '../lib/prisma';
import { ClaimStatus } from '@prisma/client';

const CLAIM_REVIEW_INCLUDE = {
  employee: { select: { fullName: true, email: true, costCentre: true } },
  items: { include: { receipts: true } },
  decisions: {
    include: { manager: { select: { fullName: true } } },
    orderBy: { decidedAt: 'desc' as const },
  },
  auditLogs: { orderBy: { timestamp: 'desc' as const } },
};

export async function getPendingClaims() {
  return prisma.expenseClaim.findMany({
    where: { status: 'SUBMITTED' },
    include: {
      employee: { select: { fullName: true, email: true, costCentre: true } },
      items: true,
    },
    orderBy: { submittedAt: 'asc' },
  });
}

export async function getClaimForReview(claimId: string) {
  const claim = await prisma.expenseClaim.findUnique({
    where: { claimId },
    include: CLAIM_REVIEW_INCLUDE,
  });
  if (!claim) throw new Error('Claim not found');
  return claim;
}

export async function approveClaim(
  claimId: string,
  managerId: string,
  comment?: string
) {
  const claim = await prisma.expenseClaim.findUnique({ where: { claimId } });
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') throw new Error('Only submitted claims can be approved');

  return prisma.$transaction([
    prisma.expenseClaim.update({
      where: { claimId },
      data: { status: 'APPROVED', managerComment: comment },
    }),
    prisma.approvalDecision.create({
      data: { claimId, managerId, decisionType: 'APPROVED', comment },
    }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'APPROVED',
        oldStatus: 'SUBMITTED' as ClaimStatus,
        newStatus: 'APPROVED' as ClaimStatus,
        actorId: managerId,
        comment,
      },
    }),
  ]);
}

export async function rejectClaim(
  claimId: string,
  managerId: string,
  comment: string
) {
  const claim = await prisma.expenseClaim.findUnique({ where: { claimId } });
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') throw new Error('Only submitted claims can be rejected');

  return prisma.$transaction([
    prisma.expenseClaim.update({
      where: { claimId },
      data: { status: 'REJECTED', managerComment: comment },
    }),
    prisma.approvalDecision.create({
      data: { claimId, managerId, decisionType: 'REJECTED', comment },
    }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'REJECTED',
        oldStatus: 'SUBMITTED' as ClaimStatus,
        newStatus: 'REJECTED' as ClaimStatus,
        actorId: managerId,
        comment,
      },
    }),
  ]);
}

export async function requestChanges(
  claimId: string,
  managerId: string,
  comment: string
) {
  const claim = await prisma.expenseClaim.findUnique({ where: { claimId } });
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') {
    throw new Error('Only submitted claims can be sent back for changes');
  }

  return prisma.$transaction([
    prisma.expenseClaim.update({
      where: { claimId },
      data: { status: 'CHANGES_REQUESTED', managerComment: comment },
    }),
    prisma.approvalDecision.create({
      data: { claimId, managerId, decisionType: 'CHANGES_REQUESTED', comment },
    }),
    prisma.auditLog.create({
      data: {
        claimId,
        action: 'CHANGES_REQUESTED',
        oldStatus: 'SUBMITTED' as ClaimStatus,
        newStatus: 'CHANGES_REQUESTED' as ClaimStatus,
        actorId: managerId,
        comment,
      },
    }),
  ]);
}
