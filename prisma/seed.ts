import "dotenv/config";
import { PrismaClient, EmploymentType, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "company_seed_1" },
    update: {},
    create: {
      id: "company_seed_1",
      name: "Kyujin Channel Inc.",
      description: "Recruitment and hiring support company.",
      websiteUrl: "https://example.com",
      location: "Tokyo",
    },
  });

    await prisma.user.upsert({
    where: {
      email: "applicant@test.com",
    },
    update: {},
    create: {
      name: "山田 太郎",
      email: "applicant@test.com",
    },
  });

  await prisma.job.createMany({
    data: [
      {
        companyId: company.id,
        title: "Sales Staff",
        description: "We are looking for a motivated sales staff member.",
        location: "Fukuoka",
        salaryMin: 500,
        salaryMax: 500,
        employmentType: EmploymentType.FULL_TIME,
        isPublished: true,
      },
      {
        companyId: company.id,
        title: "Customer Support",
        description: "Join our customer support team and help users succeed.",
        location: "Shizuoka",
        salaryMin: 300,
        salaryMax: 600,
        employmentType: EmploymentType.FULL_TIME,
        isPublished: true,
      },
      {
        companyId: company.id,
        title: "UI Designer",
        description: "Design user-friendly interfaces for our products.",
        location: "Tokyo",
        salaryMin: 500,
        salaryMax: 500,
        employmentType: EmploymentType.FULL_TIME,
        isPublished: true,
      },
    ],
  });

  await prisma.user.upsert({
    where: { email: "applicant@test.com" },
    update: {},
    create: {
      name: "Taro Yamada",
      email: "applicant@test.com",
      role: UserRole.USER,
      phone: "090-0000-0000",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });