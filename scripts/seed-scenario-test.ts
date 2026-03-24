import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  EmploymentType,
  JobReviewStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

const SCENARIO_ACCOUNTS = {
  admin: {
    id: "scenario_admin_001",
    name: "シナリオテスト管理者",
    email: "qa-admin@kyujin-ch.com",
    password: "QaAdmin123!",
    role: UserRole.ADMIN,
  },
  companyUser: {
    id: "scenario_company_user_001",
    name: "シナリオテスト企業",
    email: "qa-company@kyujin-ch.com",
    password: "QaCompany123!",
    role: UserRole.COMPANY,
  },
  jobseeker: {
    id: "scenario_user_001",
    name: "シナリオテスト求職者",
    email: "qa-user@kyujin-ch.com",
    password: "QaUser123!",
    role: UserRole.USER,
  },
} as const;

const COMPANY_ID = "scenario_company_001";

const JOBS = [
  {
    id: "scenario_job_published_001",
    title: "【公開中】シナリオテスト営業求人",
    reviewStatus: JobReviewStatus.PUBLISHED,
    isPublished: true,
    reviewComment: null,
  },
  {
    id: "scenario_job_draft_001",
    title: "【下書き】シナリオテスト営業求人",
    reviewStatus: JobReviewStatus.DRAFT,
    isPublished: false,
    reviewComment: null,
  },
  {
    id: "scenario_job_pending_001",
    title: "【審査中】シナリオテスト営業求人",
    reviewStatus: JobReviewStatus.PENDING_REVIEW,
    isPublished: false,
    reviewComment: null,
  },
  {
    id: "scenario_job_returned_001",
    title: "【差し戻し】シナリオテスト営業求人",
    reviewStatus: JobReviewStatus.RETURNED,
    isPublished: false,
    reviewComment: "仕事内容の説明をもう少し具体的にしてください。",
  },
];

async function upsertUser(input: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      password: passwordHash,
      role: input.role,
      notificationsEnabled: true,
      isActive: true,
    },
    create: {
      id: input.id,
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: input.role,
      notificationsEnabled: true,
      isActive: true,
    },
  });
}

async function main() {
  const admin = await upsertUser(SCENARIO_ACCOUNTS.admin);
  const companyUser = await upsertUser(SCENARIO_ACCOUNTS.companyUser);
  const jobseeker = await upsertUser(SCENARIO_ACCOUNTS.jobseeker);

  await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: {
      name: "シナリオテスト株式会社",
      description:
        "シナリオテスト用の会社です。企業側、求職者側、管理者側の手順確認に使います。",
      websiteUrl: "https://kyujin-ch.com",
      location: "東京都",
      companyUserId: companyUser.id,
      isActive: true,
    },
    create: {
      id: COMPANY_ID,
      name: "シナリオテスト株式会社",
      description:
        "シナリオテスト用の会社です。企業側、求職者側、管理者側の手順確認に使います。",
      websiteUrl: "https://kyujin-ch.com",
      location: "東京都",
      companyUserId: companyUser.id,
      isActive: true,
    },
  });

  for (const job of JOBS) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        companyId: COMPANY_ID,
        title: job.title,
        description:
          "シナリオテスト用の求人です。画面確認や申請フローの確認に利用します。",
        location: "東京都",
        salaryMin: 400,
        salaryMax: 600,
        employmentType: EmploymentType.FULL_TIME,
        employmentTypeDetail: "正社員",
        isPublished: job.isPublished,
        isDeleted: false,
        reviewStatus: job.reviewStatus,
        reviewComment: job.reviewComment,
        categoryTag: "営業",
        tags: ["中途採用", "未経験歓迎"],
        imageUrl: "/assets/Talk_01.png",
        requirements: "基本的なPC操作ができる方\n人と話すことが好きな方",
        desiredAptitude: "相手に合わせて丁寧に説明できる方",
        recommendedFor: "営業に挑戦したい方",
        monthlySalary: "月給 30万円〜40万円",
        annualSalary: "年収 400万円〜600万円",
        access: "東京駅から徒歩5分",
        officeName: "東京本社",
        officeDetail: "東京都千代田区丸の内1-1-1",
        benefits: ["社会保険完備", "交通費支給", "研修充実"],
        selectionProcess: "書類選考 → 面談 → 最終面接 → 内定",
        workingHours: "9:00〜18:00（実働8時間）",
        employmentPeriodType: "期間の定めなし",
        region: "関東",
        targetType: "MID_CAREER",
        graduationYear: null,
      },
      create: {
        id: job.id,
        companyId: COMPANY_ID,
        title: job.title,
        description:
          "シナリオテスト用の求人です。画面確認や申請フローの確認に利用します。",
        location: "東京都",
        salaryMin: 400,
        salaryMax: 600,
        employmentType: EmploymentType.FULL_TIME,
        employmentTypeDetail: "正社員",
        isPublished: job.isPublished,
        isDeleted: false,
        reviewStatus: job.reviewStatus,
        reviewComment: job.reviewComment,
        categoryTag: "営業",
        tags: ["中途採用", "未経験歓迎"],
        imageUrl: "/assets/Talk_01.png",
        requirements: "基本的なPC操作ができる方\n人と話すことが好きな方",
        desiredAptitude: "相手に合わせて丁寧に説明できる方",
        recommendedFor: "営業に挑戦したい方",
        monthlySalary: "月給 30万円〜40万円",
        annualSalary: "年収 400万円〜600万円",
        access: "東京駅から徒歩5分",
        officeName: "東京本社",
        officeDetail: "東京都千代田区丸の内1-1-1",
        benefits: ["社会保険完備", "交通費支給", "研修充実"],
        selectionProcess: "書類選考 → 面談 → 最終面接 → 内定",
        workingHours: "9:00〜18:00（実働8時間）",
        employmentPeriodType: "期間の定めなし",
        region: "関東",
        targetType: "MID_CAREER",
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        admin: {
          email: admin.email,
          password: SCENARIO_ACCOUNTS.admin.password,
        },
        company: {
          email: companyUser.email,
          password: SCENARIO_ACCOUNTS.companyUser.password,
          companyName: "シナリオテスト株式会社",
        },
        jobseeker: {
          email: jobseeker.email,
          password: SCENARIO_ACCOUNTS.jobseeker.password,
        },
        jobs: JOBS.map((job) => ({
          title: job.title,
          status: job.reviewStatus,
          published: job.isPublished,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
