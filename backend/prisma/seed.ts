import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const employee = await prisma.employee.upsert({
    where: { email: 'employee@fdm.com' },
    update: {},
    create: {
      fullName: 'Alice Johnson',
      email: 'employee@fdm.com',
      passwordHash: await hash('password123'),
      role: 'EMPLOYEE',
      costCentre: 'CC-001',
    },
  });

  const manager = await prisma.employee.upsert({
    where: { email: 'manager@fdm.com' },
    update: {},
    create: {
      fullName: 'Bob Smith',
      email: 'manager@fdm.com',
      passwordHash: await hash('password123'),
      role: 'LINE_MANAGER',
      costCentre: 'CC-001',
    },
  });

  const finance = await prisma.employee.upsert({
    where: { email: 'finance@fdm.com' },
    update: {},
    create: {
      fullName: 'Carol White',
      email: 'finance@fdm.com',
      passwordHash: await hash('password123'),
      role: 'FINANCE_OFFICER',
      costCentre: 'CC-FIN',
    },
  });

  // Clean up old test claims
  await prisma.approvalDecision.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.reimbursement.deleteMany({});
  await prisma.expenseClaim.deleteMany({});

  // Test claim 1 - SUBMITTED (pending review)
  await prisma.expenseClaim.create({
    data: {
      employeeId: employee.employeeId,
      status: 'SUBMITTED',
      currency: 'GBP',
      totalAmount: 245.50,
      employeeComment: 'Client visit to Manchester',
      submittedAt: new Date('2025-04-10'),
      items: {
        create: [
          {
            dateIncurred: new Date('2025-04-09'),
            category: 'TRAVEL',
            description: 'Train ticket to Manchester',
            merchant: 'National Rail',
            amount: 89.50,
            vatAmount: 0,
            currency: 'GBP',
          },
          {
            dateIncurred: new Date('2025-04-09'),
            category: 'MEAL',
            description: 'Working lunch with client',
            merchant: 'Cafe Rouge',
            amount: 156.00,
            vatAmount: 26.00,
            currency: 'GBP',
          },
        ],
      },
    },
  });

  // Test claim 2 - SUBMITTED (pending review)
  await prisma.expenseClaim.create({
    data: {
      employeeId: employee.employeeId,
      status: 'SUBMITTED',
      currency: 'GBP',
      totalAmount: 89.00,
      employeeComment: 'Office supplies for home working',
      submittedAt: new Date('2025-04-12'),
      items: {
        create: [
          {
            dateIncurred: new Date('2025-04-11'),
            category: 'EQUIPMENT',
            description: 'Keyboard and mouse',
            merchant: 'Amazon',
            amount: 89.00,
            vatAmount: 14.83,
            currency: 'GBP',
          },
        ],
      },
    },
  });

  // Test claim 3 - SUBMITTED (pending review, high amount)
  await prisma.expenseClaim.create({
    data: {
      employeeId: employee.employeeId,
      status: 'SUBMITTED',
      currency: 'GBP',
      totalAmount: 1250.00,
      employeeComment: 'Conference attendance - London Tech Summit',
      submittedAt: new Date('2025-04-08'),
      items: {
        create: [
          {
            dateIncurred: new Date('2025-04-07'),
            category: 'ACCOMMODATION',
            description: 'Hotel - 2 nights',
            merchant: 'Premier Inn',
            amount: 980.00,
            vatAmount: 163.33,
            currency: 'GBP',
          },
          {
            dateIncurred: new Date('2025-04-07'),
            category: 'TRAVEL',
            description: 'Return flights',
            merchant: 'British Airways',
            amount: 270.00,
            vatAmount: 0,
            currency: 'GBP',
          },
        ],
      },
    },
  });

  // Test claim 4 - APPROVED
  const approvedClaim = await prisma.expenseClaim.create({
    data: {
      employeeId: employee.employeeId,
      status: 'APPROVED',
      currency: 'GBP',
      totalAmount: 45.00,
      employeeComment: 'Team lunch',
      submittedAt: new Date('2025-04-01'),
      items: {
        create: [
          {
            dateIncurred: new Date('2025-03-31'),
            category: 'MEAL',
            description: 'Team lunch',
            merchant: 'Pret a Manger',
            amount: 45.00,
            vatAmount: 7.50,
            currency: 'GBP',
          },
        ],
      },
    },
  });

  await prisma.approvalDecision.create({
    data: {
      claimId: approvedClaim.claimId,
      managerId: manager.employeeId,
      decisionType: 'APPROVED',
      comment: 'Approved - receipts verified',
      decidedAt: new Date('2025-04-02'),
    },
  });

  // Test claim 5 - REJECTED
  const rejectedClaim = await prisma.expenseClaim.create({
    data: {
      employeeId: employee.employeeId,
      status: 'REJECTED',
      currency: 'GBP',
      totalAmount: 500.00,
      employeeComment: 'Personal equipment',
      submittedAt: new Date('2025-03-25'),
      items: {
        create: [
          {
            dateIncurred: new Date('2025-03-24'),
            category: 'EQUIPMENT',
            description: 'Personal laptop upgrade',
            merchant: 'Apple Store',
            amount: 500.00,
            vatAmount: 83.33,
            currency: 'GBP',
          },
        ],
      },
    },
  });

  await prisma.approvalDecision.create({
    data: {
      claimId: rejectedClaim.claimId,
      managerId: manager.employeeId,
      decisionType: 'REJECTED',
      comment: 'Personal equipment not covered by expenses policy',
      decidedAt: new Date('2025-03-26'),
    },
  });

  console.log('Seeded demo users:');
  console.log(`  Employee:        ${employee.email} / password123`);
  console.log(`  Line Manager:    ${manager.email} / password123`);
  console.log(`  Finance Officer: ${finance.email} / password123`);
  console.log('Seeded 5 test claims (3 pending, 1 approved, 1 rejected)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());