import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const pw = await bcrypt.hash("admin1234", 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@kyujin-ch.com" },
    update: {},
    create: { name: "管理者", email: "admin@kyujin-ch.com", password: pw, role: "ADMIN" },
  });
  console.log("Admin:", admin.email);

  // Company user
  const companyUser = await prisma.user.upsert({
    where: { email: "company@example.com" },
    update: {},
    create: { name: "田中太郎", email: "company@example.com", password: pw, role: "COMPANY" },
  });
  console.log("Company user:", companyUser.email);

  // Link to existing company or create one
  const existing = await prisma.company.findFirst({ where: { companyUserId: companyUser.id } });
  if (!existing) {
    const co = await prisma.company.findFirst({ where: { name: "すごくいい株式会社" } });
    if (co && !co.companyUserId) {
      await prisma.company.update({ where: { id: co.id }, data: { companyUserId: companyUser.id } });
      console.log("Linked to existing company:", co.name);
    } else {
      const newCo = await prisma.company.create({
        data: { name: "テスト企業株式会社", companyUserId: companyUser.id, location: "東京都渋谷区", description: "テスト用の企業です" },
      });
      console.log("Created company:", newCo.name);
    }
  } else {
    console.log("Already linked:", existing.name);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
