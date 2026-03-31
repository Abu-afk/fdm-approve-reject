// Types for our approval system
export type ClaimStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface Claim {
  id: string;
  status: ClaimStatus;
  employeeId: string;
  totalAmount: number;
  description: string;
  createdAt: Date;
}

export interface ApprovalDecision {
  id: string;
  claimId: string;
  managerId: string;
  decisionType: ClaimStatus;
  comment: string;
  decidedAt: Date;
}

// In-memory store (acts as our database for the prototype)
const claims: Claim[] = [
  { id: '1', status: 'SUBMITTED', employeeId: 'emp1', totalAmount: 150.00, description: 'Travel expenses', createdAt: new Date() },
  { id: '2', status: 'SUBMITTED', employeeId: 'emp2', totalAmount: 300.00, description: 'Office supplies', createdAt: new Date() },
];

const decisions: ApprovalDecision[] = [];

// Get all pending (submitted) claims
export const getPendingClaims = (): Claim[] => {
  return claims.filter(c => c.status === 'SUBMITTED');
};

// Get a single claim by ID
export const getClaimById = (claimId: string): Claim | undefined => {
  return claims.find(c => c.id === claimId);
};

// Approve a claim
export const approveClaim = (claimId: string, managerId: string, comment: string): ApprovalDecision => {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') throw new Error('Only submitted claims can be approved');

  claim.status = 'APPROVED';

  const decision: ApprovalDecision = {
    id: Date.now().toString(),
    claimId,
    managerId,
    decisionType: 'APPROVED',
    comment,
    decidedAt: new Date(),
  };
  decisions.push(decision);
  return decision;
};

// Reject a claim
export const rejectClaim = (claimId: string, managerId: string, comment: string): ApprovalDecision => {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') throw new Error('Only submitted claims can be rejected');
  if (!comment) throw new Error('A comment is required when rejecting a claim');

  claim.status = 'REJECTED';

  const decision: ApprovalDecision = {
    id: Date.now().toString(),
    claimId,
    managerId,
    decisionType: 'REJECTED',
    comment,
    decidedAt: new Date(),
  };
  decisions.push(decision);
  return decision;
};

// Request changes on a claim
export const requestChanges = (claimId: string, managerId: string, comment: string): ApprovalDecision => {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) throw new Error('Claim not found');
  if (claim.status !== 'SUBMITTED') throw new Error('Only submitted claims can have changes requested');
  if (!comment) throw new Error('A comment is required when requesting changes');

  claim.status = 'CHANGES_REQUESTED';

  const decision: ApprovalDecision = {
    id: Date.now().toString(),
    claimId,
    managerId,
    decisionType: 'CHANGES_REQUESTED',
    comment,
    decidedAt: new Date(),
  };
  decisions.push(decision);
  return decision;
};