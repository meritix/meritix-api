import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      email: 'admin@meritix.com',
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log('================================');
  console.log('Admin password reset successfully');
  console.log('Email    : admin@meritix.com');
  console.log('Password : Password123');
  console.log('================================');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });