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

  console.log('Seeded demo users:');
  console.log(`  Employee:        ${employee.email} / password123`);
  console.log(`  Line Manager:    ${manager.email} / password123`);
  console.log(`  Finance Officer: ${finance.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
