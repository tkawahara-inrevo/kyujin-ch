import "dotenv/config";
import { PrismaClient, EmploymentType, UserRole, MessageSenderType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 企業
  const company = await prisma.company.upsert({
    where: { id: "company_seed_1" },
    update: {},
    create: {
      id: "company_seed_1",
      name: "すごくいい株式会社",
      description:
        "企画、開発、制作、販売及び保守/ウェブサイト、ウェブコンテンツの企画、制作、保守及び管理/人材育成のための教育コンテンツ作成、研修及び指導",
      websiteUrl: "https://example.com",
      location: "福岡県",
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: "company_seed_2" },
    update: {},
    create: {
      id: "company_seed_2",
      name: "とてもいい株式会社",
      description: "革新的なサービスを提供する会社です。",
      websiteUrl: "https://example2.com",
      location: "静岡県",
    },
  });

  const company3 = await prisma.company.upsert({
    where: { id: "company_seed_3" },
    update: {},
    create: {
      id: "company_seed_3",
      name: "かっこいい株式会社",
      description: "デザイン特化のクリエイティブ企業です。",
      websiteUrl: "https://example3.com",
      location: "東京都",
    },
  });

  // 求職者ユーザー
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "applicant@test.com" },
    update: { password: hashedPassword },
    create: {
      name: "山田 太郎",
      email: "applicant@test.com",
      password: hashedPassword,
      role: UserRole.USER,
      phone: "090-0000-0000",
      notificationsEnabled: true,
    },
  });

  // 求人
  const job1 = await prisma.job.upsert({
    where: { id: "job_seed_1" },
    update: { categoryTag: "営業", tags: ["未経験歓迎", "中途採用"] },
    create: {
      id: "job_seed_1",
      companyId: company.id,
      title: "【未経験歓迎】充実の福利厚生が自慢！人材営業スタッフ",
      description:
        "地方企業の可能性を解き放つ、新しい未来を創り出していきます。",
      location: "福岡県",
      salaryMin: 500,
      salaryMax: 500,
      employmentType: EmploymentType.FULL_TIME,
      isPublished: true,
      reviewStatus: "PUBLISHED",
      categoryTag: "営業",
      tags: ["未経験歓迎", "中途採用"],
    },
  });

  const job2 = await prisma.job.upsert({
    where: { id: "job_seed_2" },
    update: { categoryTag: "経理", tags: ["未経験歓迎", "リモート勤務可"] },
    create: {
      id: "job_seed_2",
      companyId: company2.id,
      title: "あなたの新しいスタートを全力でサポートします！",
      description: "経験を活かして新しいキャリアを築きましょう。",
      location: "静岡県",
      salaryMin: null,
      salaryMax: null,
      employmentType: EmploymentType.FULL_TIME,
      isPublished: true,
      reviewStatus: "PUBLISHED",
      categoryTag: "経理",
      tags: ["未経験歓迎", "リモート勤務可"],
    },
  });

  const job3 = await prisma.job.upsert({
    where: { id: "job_seed_3" },
    update: { categoryTag: "デザイナー", tags: ["急募", "中途採用"] },
    create: {
      id: "job_seed_3",
      companyId: company3.id,
      title: "デザイナー急募！あなたのアイデアお待ちしています",
      description: "UI/UXデザイナーを急募しています。",
      location: "東京都",
      salaryMin: 500,
      salaryMax: 500,
      employmentType: EmploymentType.FULL_TIME,
      isPublished: true,
      reviewStatus: "PUBLISHED",
      categoryTag: "デザイナー",
      tags: ["急募", "中途採用"],
    },
  });

  // 応募データ（job1に応募済み）
  const existingApp = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId: job1.id } },
  });

  let application = existingApp;
  if (!application) {
    application = await prisma.application.create({
      data: {
        userId: user.id,
        jobId: job1.id,
        motivation:
          "御社のミッションに共感し、地方企業の発展に貢献したいと考え応募しました。",
      },
    });
  }

  // 会話データ
  let conversation = await prisma.conversation.findUnique({
    where: { applicationId: application.id },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { applicationId: application.id },
    });
  }

  // メッセージサンプル（会社側から）
  const msgCount = await prisma.message.count({
    where: { conversationId: conversation.id },
  });

  if (msgCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: company.id,
          senderType: MessageSenderType.COMPANY,
          body: "この度はご応募いただきありがとうございます！選考を進めさせていただきます。",
          isRead: false,
          createdAt: new Date("2026-02-20T10:00:00Z"),
        },
        {
          conversationId: conversation.id,
          senderId: user.id,
          senderType: MessageSenderType.USER,
          body: "ありがとうございます！よろしくお願いいたします。",
          isRead: true,
          createdAt: new Date("2026-02-20T10:30:00Z"),
        },
        {
          conversationId: conversation.id,
          senderId: company.id,
          senderType: MessageSenderType.COMPANY,
          body: "来週の月曜日にオンライン面談をお願いできますでしょうか？",
          isRead: false,
          createdAt: new Date("2026-02-21T09:00:00Z"),
        },
      ],
    });
  }

  console.log("Seed completed:", {
    companies: [company.name, company2.name, company3.name],
    user: user.email,
    jobs: [job1.title, job2.title, job3.title],
    applicationId: application.id,
    conversationId: conversation.id,
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
