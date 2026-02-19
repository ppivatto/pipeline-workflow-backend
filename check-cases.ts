
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const email = 'rfer@mail.com';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log(`User ID: ${user.id}`);

  const cases = await prisma.case.findMany({
    where: { assignedTo: user.id },
    select: { id: true, workflowStep: true, account: { select: { name: true } } }
  });

  console.log(`Total cases for user: ${cases.length}`);
  cases.forEach(c => {
    console.log(`- Case ${c.id.substring(0, 8)}... | Account: ${c.account.name} | Step: ${c.workflowStep}`);
  });
}

check()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
