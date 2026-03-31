export type Role = 'EMPLOYEE' | 'LINE_MANAGER' | 'FINANCE_OFFICER';

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'WITHDRAWN';

export interface User {
  employeeId: string;
  fullName: string;
  email: string;
  role: Role;
  costCentre: string;
}

export interface Receipt {
  receiptId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadDate: string;
  vatNumber?: string;
  totalOnReceipt?: number;
}

export interface ExpenseItem {
  itemId: string;
  dateIncurred: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  vatAmount: number;
  merchant: string;
  receipts: Receipt[];
}

export interface ApprovalDecision {
  decisionId: string;
  decisionType: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  decidedAt: string;
  comment?: string;
  manager: { fullName: string };
}

export interface AuditLog {
  logId: string;
  timestamp: string;
  action: string;
  oldStatus?: ClaimStatus;
  newStatus?: ClaimStatus;
  actorId: string;
  comment?: string;
}

export interface Reimbursement {
  reimbursementId: string;
  processedAt: string;
  paidAt?: string;
  paymentReference?: string;
  amountPaid: number;
  currency: string;
}

export interface ExpenseClaim {
  claimId: string;
  createdAt: string;
  submittedAt?: string;
  status: ClaimStatus;
  totalAmount: number;
  currency: string;
  employeeComment?: string;
  managerComment?: string;
  financeComment?: string;
  employee?: { fullName: string; email: string; costCentre: string };
  items: ExpenseItem[];
  decisions?: ApprovalDecision[];
  auditLogs?: AuditLog[];
  reimbursement?: Reimbursement;
}
