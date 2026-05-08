import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const TEST_EMAILS = [
  "seed_techbridge@kyujin-test.invalid",
  "seed_mktlab@kyujin-test.invalid",
  "seed_greencare@kyujin-test.invalid",
  "seed_createdesign@kyujin-test.invalid",
  "seed_assistsales@kyujin-test.invalid",
  "seed_applicant_free@kyujin-test.invalid",
];

async function main() {
  // テスト企業ユーザーからcompanyIdを取得
  const companyUsers = await prisma.user.findMany({
    where: { email: { in: TEST_EMAILS }, role: "COMPANY" },
    include: { company: true },
  });

  const companyIds = companyUsers.flatMap(u => u.company ? [u.company.id] : []);
  console.log(`企業: ${companyIds.length}社`);

  // 求人ID取得
  const jobs = await prisma.job.findMany({
    where: { companyId: { in: companyIds } },
    select: { id: true },
  });
  const jobIds = jobs.map(j => j.id);
  console.log(`求人: ${jobIds.length}件`);

  // 応募ID取得（求職者テストユーザー含む）
  const testApplicant = await prisma.user.findUnique({
    where: { email: "seed_applicant_free@kyujin-test.invalid" },
  });
  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { jobId: { in: jobIds } },
        ...(testApplicant ? [{ userId: testApplicant.id }] : []),
      ],
    },
    select: { id: true },
  });
  const applicationIds = applications.map(a => a.id);
  console.log(`応募: ${applicationIds.length}件`);

  // 削除（依存関係順）
  await prisma.charge.deleteMany({ where: { applicationId: { in: applicationIds } } });
  await prisma.message.deleteMany({ where: { conversation: { applicationId: { in: applicationIds } } } });
  await prisma.conversation.deleteMany({ where: { applicationId: { in: applicationIds } } });
  await prisma.application.deleteMany({ where: { id: { in: applicationIds } } });
  await prisma.job.deleteMany({ where: { id: { in: jobIds } } });
  await prisma.company.deleteMany({ where: { id: { in: companyIds } } });
  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } });

  console.log("削除完了！");
}

main().catch(console.error).finally(() => prisma.$disconnect());
