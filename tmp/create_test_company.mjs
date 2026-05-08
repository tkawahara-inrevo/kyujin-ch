import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const hashedPassword = await bcrypt.hash("Test1234!", 10);

const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email: "test@kyujin-ch.jp",
      password: hashedPassword,
      role: "COMPANY",
      name: "テスト企業",
    },
  });
  const company = await tx.company.create({
    data: {
      name: "テスト企業",
      isTest: true,
      companyUserId: user.id,
    },
  });
  return { userId: user.id, companyId: company.id };
});

console.log("作成完了:", JSON.stringify(result));
await prisma.$disconnect();
