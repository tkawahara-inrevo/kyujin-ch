import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // テックブリッジの求人を取得
  const company = await prisma.company.findFirst({
    where: { name: "株式会社テックブリッジ" },
    include: { jobs: { where: { isPublished: true, isDeleted: false }, take: 1 } },
  });

  if (!company || company.jobs.length === 0) {
    console.error("テックブリッジまたは求人が見つかりません");
    return;
  }

  const job = company.jobs[0];
  console.log(`求人: ${job.title}`);

  // テスト求職者を取得 or 作成
  let user = await prisma.user.findUnique({ where: { email: "seed_applicant_free@kyujin-test.invalid" } });
  if (!user) {
    const password = await bcrypt.hash("Test1234!", 10);
    user = await prisma.user.create({
      data: {
        name: "無料テスト太郎",
        email: "seed_applicant_free@kyujin-test.invalid",
        username: "seed_free_applicant",
        password,
        role: "USER",
        isActive: true,
      },
    });
    console.log(`求職者作成: ${user.name}`);
  } else {
    console.log(`求職者既存: ${user.name}`);
  }

  // 既存応募チェック
  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId: job.id } },
  });
  if (existing) {
    console.log("既に応募データが存在します");
    return;
  }

  // 無料期間中（4/6）の日付で作成
  const appliedAt = new Date("2026-04-06T03:00:00.000Z"); // JST 12:00

  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        motivation: "無料キャンペーン期間中のテスト応募です。",
        createdAt: appliedAt,
        updatedAt: appliedAt,
      },
    });

    await tx.conversation.create({
      data: { applicationId: app.id },
    });

    await tx.charge.create({
      data: {
        applicationId: app.id,
        amount: 0,
        billingMonth: "2026-04",
        createdAt: appliedAt,
      },
    });

    return app;
  });

  console.log(`\n完了！`);
  console.log(`応募ID: ${application.id}`);
  console.log(`求人: ${job.title}`);
  console.log(`請求額: ¥0（無料キャンペーン期間）`);
  console.log(`請求月: 2026-04`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
