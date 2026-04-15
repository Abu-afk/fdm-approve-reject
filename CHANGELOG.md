# Changelog

## [fix/flat-file-db] — 2026-04-15

### Replace Prisma/PostgreSQL with Flat-File JSON Database

Removed the Prisma ORM and PostgreSQL dependency entirely. The backend now persists data in plain `.txt` files (JSON arrays) under `backend/data/`, so any teammate can clone and run the project without installing or configuring a database.

---

### New Files

#### `backend/src/lib/db.ts`
A lightweight in-memory database layer that reads/writes JSON from flat files.

- **Types** defined: `Role`, `ClaimStatus`, `DecisionType`, `Employee`, `ExpenseClaim`, `ExpenseItem`, `Receipt`, `ApprovalDecision`, `Reimbursement`, `AuditLog`
- **Collections** exposed via `db.*` with lookup helpers:
  - `db.employees` — `byId`, `byEmail`, `all`, `insert`
  - `db.claims` — `byId`, `byEmployee`, `byStatus`, `all`, `insert`, `update`
  - `db.items` — `byId`, `byClaim`, `insert`, `update`, `remove`
  - `db.receipts` — `byId`, `byItem`, `insert`, `remove`
  - `db.decisions` — `byClaim`, `insert`
  - `db.reimbursements` — `byClaim`, `insert`
  - `db.auditlogs` — `byClaim`, `insert`
- `newId()` utility generates random UUIDs via `crypto`

#### `backend/data/*.txt`
Seed data files (JSON arrays, one per collection):

| File | Contents |
|---|---|
| `employees.txt` | 29 seeded employee records with hashed passwords |
| `claims.txt` | Initial empty array |
| `items.txt` | Initial empty array |
| `receipts.txt` | Initial empty array |
| `decisions.txt` | Initial empty array |
| `reimbursements.txt` | Initial empty array |
| `auditlogs.txt` | Initial empty array |

---

### Modified Files

#### `backend/src/services/auth.service.ts`
- Replaced `prisma.employee.findUnique` with `db.employees.byEmail`

#### `backend/src/services/claims.service.ts`
- Replaced all `prisma.*` calls with `db.*` equivalents
- Added `withItems()` helper — attaches items + receipts to a claim
- Added `fullClaim()` helper — attaches items, receipts, decisions (with manager name), and audit logs
- Receipt upload/delete logic moved from the controller into new `createReceipt` and `deleteReceipt` service functions

#### `backend/src/services/manager.service.ts`
- Replaced all `prisma.*` calls with `db.*` equivalents
- Replaced `CLAIM_REVIEW_INCLUDE` Prisma include object with `fullClaimForReview()` helper that manually joins employees, items, receipts, decisions, and audit logs
- `getPendingClaims()` now sorts by `submittedAt` in JS instead of via Prisma `orderBy`

#### `backend/src/services/finance.service.ts`
- Replaced all `prisma.*` calls with `db.*` equivalents
- `getApprovedClaims()` manually joins employee details and items
- `getClaimForProcessing()` manually assembles full claim with employee, items, receipts, decisions, reimbursement, and audit logs

#### `backend/src/controllers/claims.controller.ts`
- Removed direct `prisma` import — controller no longer touches the DB layer
- `uploadReceipt` handler simplified: delegates to `claimsService.createReceipt()`
- `deleteReceipt` handler simplified: delegates to `claimsService.deleteReceipt()`

---

### Removed

- `import prisma from '../lib/prisma'` removed from all service and controller files
- `import { ClaimStatus } from '@prisma/client'` replaced with local type from `db.ts`
- No Prisma schema or migration dependencies remain in the backend runtime path
