/**
 * モバイルアプリ動作確認用のテスト企業＋求人を作成。
 * - Company.isTest = true なので、公開リストには出ない
 * - 求人IDは固定で出力するので、アプリから直接 jobs/{id} でアクセス
 *
 * 実行: npx tsx scripts/seed-mobile-test.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

const COMPANY_CORPORATE_NUMBER = "9999999999999"; // ダミーの法人番号 (13桁)
const COMPANY_USER_EMAIL = "test-mobile@example.invalid";
const COMPANY_USER_PASSWORD = "test-mobile-pass-2026";

async function main() {
  console.log("=== モバイルテスト用 求人作成 ===");

  // 既存のテスト企業を削除して作り直し
  const existing = await prisma.company.findUnique({
    where: { corporateNumber: COMPANY_CORPORATE_NUMBER },
    include: { users: true },
  });
  if (existing) {
    console.log(`既存テスト企業を削除: ${existing.name}`);
    // 関連レコードもカスケードで消える想定
    await prisma.user.deleteMany({
      where: { id: { in: existing.users.map((u) => u.id) } },
    });
    await prisma.company.delete({ where: { id: existing.id } });
  }

  // 企業ユーザー作成
  const hashedPassword = await bcrypt.hash(COMPANY_USER_PASSWORD, 10);
  const companyUser = await prisma.user.create({
    data: {
      email: COMPANY_USER_EMAIL,
      password: hashedPassword,
      name: "テストモバイル企業 担当者",
      role: "COMPANY",
      isActive: true,
      notificationsEnabled: false, // テスト通知が飛ばないように
    },
  });

  // 企業作成
  const company = await prisma.company.create({
    data: {
      name: "求人ちゃんねる動作確認用 株式会社",
      corporateNumber: COMPANY_CORPORATE_NUMBER,
      industry: "情報通信業",
      employeeCount: "1〜10名",
      description: "モバイルアプリの動作確認用に作られたテスト企業です。一般には公開されません。",
      adminPassword: COMPANY_USER_PASSWORD,
      isActive: true,
      isTest: true, // ← 公開リストから除外
      users: { connect: { id: companyUser.id } },
      companyUserId: companyUser.id,
    },
  });

  // 求人作成
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: "【モバイル動作確認用】Androidエンジニア",
      description:
        "これはモバイルアプリの動作確認用に作られた求人です。\n\n実際の募集ではありません。応募テストは河原のみがアプリから行ってください。",
      employmentType: "FULL_TIME",
      categoryTag: "エンジニア",
      tags: ["テスト用", "動作確認", "アプリ動作テスト"],
      isPublished: true,
      reviewStatus: "PUBLISHED",
      reviewStatusChangedAt: new Date(),
      isDeleted: false,
      location: "東京都",
      region: "関東",
      officeDetail: "テスト用住所",
      salaryType: "annual",
      salaryMin: 4000000,
      salaryMax: 8000000,
      requirements: "テスト用なので応募不要です。",
      recommendedFor: "テスト",
      benefits: ["社会保険完備", "リモートワーク可"],
      selectionProcess: "書類選考 → 面接1回",
      workingHours: "10:00〜19:00（休憩1時間）",
      holidayType: "完全週休2日制",
      annualHolidayCount: 125,
      targetType: "MID_CAREER",
    },
  });

  console.log("\n=== 作成完了 ===");
  console.log("企業 ID:", company.id);
  console.log("企業名:", company.name);
  console.log("企業ユーザー:", COMPANY_USER_EMAIL);
  console.log("企業ユーザーPW:", COMPANY_USER_PASSWORD);
  console.log("\n--- 重要 ---");
  console.log("求人 ID:", job.id);
  console.log("求人タイトル:", job.title);
  console.log("\nアプリでこの job_id を使って詳細画面にアクセスしてください。");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
