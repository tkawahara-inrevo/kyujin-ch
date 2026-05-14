/**
 * ステージング環境用シードスクリプト
 * 企業50社・求人150件・求職者50名
 *
 * 実行: npx tsx scripts/seed-staging.ts
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, EmploymentType, JobReviewStatus, ApplicationStatus } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---- データ定義 ----

const CATEGORIES = ["営業", "IT", "コーポレートスタッフ", "企画/マーケティング", "医療/介護/福祉", "製造/物流/軽作業"] as const;

const PREFECTURES = ["東京都", "大阪府", "神奈川県", "愛知県", "福岡県", "北海道", "宮城県", "広島県", "埼玉県", "千葉県"];

const COMPANY_SUFFIXES = ["株式会社", "有限会社", "合同会社"];
const COMPANY_NAMES = [
  "アクシア", "ブライト", "ネクスト", "フロンティア", "リンク", "グローバル", "スマート", "クリエイト",
  "プロジェクト", "ソリューション", "テクノ", "システム", "コンサルティング", "サービス", "ネットワーク",
  "デジタル", "インフォ", "アドバンス", "プレミア", "フューチャー", "スタンダード", "エクセル", "コア",
  "ユニーク", "パートナー", "セントラル", "ダイナミクス", "イノベーション", "サクセス", "トラスト",
  "ビジョン", "ハーモニー", "エース", "ライフ", "ビジネス", "ケアサポート", "テック", "マーケット",
  "エキスパート", "ワンダー", "スペース", "ドリーム", "キャリア", "ウィル", "アレス", "ベスト",
  "シナジー", "ストラテジー", "ロジック", "クオリティ",
];

const JOB_TITLES: Record<string, string[]> = {
  "営業": ["法人営業", "インサイドセールス", "フィールドセールス", "アカウントマネージャー", "新規開拓営業"],
  "IT": ["バックエンドエンジニア", "フロントエンドエンジニア", "インフラエンジニア", "PMO", "データエンジニア"],
  "コーポレートスタッフ": ["人事・労務", "経理・財務", "総務担当", "法務アシスタント", "秘書・アシスタント"],
  "企画/マーケティング": ["マーケティング担当", "プロモーション企画", "Webマーケター", "コンテンツディレクター", "事業企画"],
  "医療/介護/福祉": ["介護福祉士", "ケアマネージャー", "看護助手", "生活相談員", "訪問介護スタッフ"],
  "製造/物流/軽作業": ["生産管理", "品質管理", "倉庫スタッフ", "ドライバー", "製造オペレーター"],
};

const FIRST_NAMES_M = ["太郎", "健太", "翔", "大樹", "竜也", "浩二", "誠", "拓哉", "航", "陽介", "俊介", "亮", "勇人", "直樹", "啓介"];
const FIRST_NAMES_F = ["花子", "恵美", "あやか", "みなみ", "さくら", "ゆき", "里奈", "麻衣", "奈緒", "彩", "千尋", "明日香", "遥", "咲", "結衣"];
const LAST_NAMES = ["田中", "鈴木", "佐藤", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤", "吉田", "山田", "松本", "井上", "木村", "林", "清水", "山崎", "阿部", "池田"];

const INDUSTRIES = ["IT・通信", "医療・福祉", "製造業", "小売・流通", "金融・保険", "建設・不動産", "食品・飲料", "教育・学習支援", "人材・コンサル", "メディア・広告"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pad2(n: number) { return String(n).padStart(2, "0"); }

// ---- リセット ----
async function resetStaging() {
  console.log("Resetting staging data...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.invalidRequest.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobView.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.monthlyBilling.deleteMany();
  await prisma.resumeProfile.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  // 管理者・企業・求職者ユーザーを削除（Account/Sessionも連鎖削除）
  await prisma.user.deleteMany({ where: { role: { in: ["COMPANY", "USER", "ADMIN"] } } });
}

async function main() {
  await resetStaging();

  const companyPass = await bcrypt.hash("Company1234!", 10);
  const userPass = await bcrypt.hash("User1234!", 10);
  const adminPass = await bcrypt.hash("Admin1234!", 10);

  // ---- 管理者アカウント ----
  await prisma.user.create({
    data: {
      name: "管理者",
      email: "admin@staging.kyujin-ch.jp",
      username: "staging_admin",
      password: adminPass,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin created");

  // ---- 企業50社 ----
  const companies: { id: string; userId: string; name: string; category: string; prefecture: string }[] = [];
  for (let i = 0; i < 50; i++) {
    const suffix = rand(COMPANY_SUFFIXES);
    const name = `${COMPANY_NAMES[i % COMPANY_NAMES.length]}${suffix}`;
    const category = CATEGORIES[i % CATEGORIES.length]!;
    const prefecture = PREFECTURES[i % PREFECTURES.length]!;

    const companyUser = await prisma.user.create({
      data: {
        name,
        email: `company${i + 1}@staging-test.jp`,
        password: companyPass,
        role: "COMPANY",
      },
    });

    const company = await prisma.company.create({
      data: {
        name,
        industry: rand(INDUSTRIES),
        businessDescription: `${category}領域を中心に事業を展開する企業です。${prefecture}を拠点に、全国規模でサービスを提供しています。`,
        employeeCount: rand(["10〜50名", "50〜100名", "100〜300名", "300〜500名", "500名以上"]),
        foundedYear: String(randInt(1990, 2020)),
        capital: rand(["100万円", "500万円", "1,000万円", "5,000万円", "1億円以上"]),
        websiteUrl: `https://example-company${i + 1}.jp`,
        prefecture,
        city: `${prefecture.replace(/都|道|府|県/, "")}市`,
        postalCode: `${randInt(100, 999)}-${randInt(1000, 9999)}`,
        isActive: true,
        companyUserId: companyUser.id,
        adminPassword: "Company1234!",
      },
    });

    companies.push({ id: company.id, userId: companyUser.id, name, category, prefecture });
  }
  console.log(`✓ ${companies.length} companies created`);

  // ---- 求人150件（1社あたり3件） ----
  let jobCount = 0;
  for (const company of companies) {
    const profile = JOB_TITLES[company.category] ?? JOB_TITLES["営業"]!;
    for (let j = 0; j < 3; j++) {
      const titleBase = profile[j % profile.length]!;
      const prefixes = ["積極採用中", "経験者優遇", "未経験歓迎", "成長事業"];
      const title = `【${prefixes[(jobCount + j) % prefixes.length]}】${titleBase}募集`;
      const salaryMin = randInt(300, 500) * 10000;
      const salaryMax = salaryMin + randInt(50, 200) * 10000;

      await prisma.job.create({
        data: {
          companyId: company.id,
          title,
          description: `${company.name}では、${company.prefecture}拠点の組織強化に向けて新しい仲間を募集しています。\n\n入社後は既存メンバーのサポートを受けながら業務理解を深め、段階的に担当範囲を広げていける体制です。\n\n現場目線の改善提案も歓迎しており、日々の業務をより良くしていく動きに関われます。`,
          location: company.prefecture,
          region: company.prefecture,
          employmentType: j % 5 === 0 ? EmploymentType.CONTRACT : EmploymentType.FULL_TIME,
          salaryMin,
          salaryMax,
          salaryType: "年俸",
          annualSalary: `年収 ${Math.round(salaryMin / 10000)}万円〜${Math.round(salaryMax / 10000)}万円`,
          monthlySalary: `月給 ${Math.round(salaryMin / 10000 / 12)}万円〜`,
          categoryTag: company.category,
          jobSubcategory: titleBase,
          isPublished: true,
          reviewStatus: JobReviewStatus.PUBLISHED,
          targetType: j % 4 === 0 ? "NEW_GRAD" : "MID_CAREER",
          workingHours: rand(["9:00〜18:00（実働8時間）", "9:30〜18:30", "フレックスタイム制（コアタイム11:00〜15:00）"]),
          benefits: ["社会保険完備", "交通費支給", rand(["リモートワーク可", "昇給あり", "賞与あり", "資格取得支援"])],
          holidayType: rand(["完全週休2日制（土日祝）", "週休2日制", "シフト制"]),
          annualHolidayCount: rand([120, 125, 130]),
          experienceType: j % 3 === 0 ? "未経験者歓迎" : "経験者歓迎",
          viewCount: randInt(0, 500),
          tags: [company.category, "中途採用", rand(["フレックス制", "リモート可", "残業少なめ"])],
        },
      });
      jobCount++;
    }
  }
  console.log(`✓ ${jobCount} jobs created`);

  // ---- 求職者50名 ----
  const users: { id: string; name: string }[] = [];
  for (let i = 0; i < 50; i++) {
    const isFemale = i % 3 === 0;
    const lastName = LAST_NAMES[i % LAST_NAMES.length]!;
    const firstName = isFemale
      ? FIRST_NAMES_F[i % FIRST_NAMES_F.length]!
      : FIRST_NAMES_M[i % FIRST_NAMES_M.length]!;
    const fullName = `${lastName}${firstName}`;
    const pref = PREFECTURES[i % PREFECTURES.length]!;
    const birthYear = randInt(1985, 2000);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: `user${i + 1}@staging-test.jp`,
        password: userPass,
        role: "USER",
        lastName,
        firstName,
        lastNameKana: `テスト${i + 1}`,
        firstNameKana: "テスト",
        birthDate: new Date(`${birthYear}-${pad2(randInt(1, 12))}-${pad2(randInt(1, 28))}`),
        gender: isFemale ? "女性" : "男性",
        phone: `0${randInt(70, 90)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
        postalCode: `${randInt(100, 999)}-${randInt(1000, 9999)}`,
        prefecture: pref,
        cityTown: `${pref.replace(/都|道|府|県/, "")}市`,
      },
    });
    users.push({ id: user.id, name: fullName });
  }
  console.log(`✓ ${users.length} users created`);

  // ---- 応募データ（求職者1人あたり2〜3件ランダム） ----
  const allJobs = await prisma.job.findMany({ select: { id: true, companyId: true } });
  const statuses = [ApplicationStatus.APPLIED, ApplicationStatus.REVIEWING, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER, ApplicationStatus.HIRED, ApplicationStatus.REJECTED];
  const appliedPairs = new Set<string>();
  let appCount = 0;

  for (const user of users) {
    const appCount_ = randInt(2, 4);
    const shuffled = [...allJobs].sort(() => Math.random() - 0.5).slice(0, appCount_);
    for (const job of shuffled) {
      const key = `${user.id}-${job.id}`;
      if (appliedPairs.has(key)) continue;
      appliedPairs.add(key);
      await prisma.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          status: rand(statuses),
          motivation: `${rand(["貴社の事業に共感し", "スキルアップを目指して", "キャリアチェンジを考えており"])}応募いたしました。ぜひよろしくお願いいたします。`,
        },
      });
      appCount++;
    }
  }
  console.log(`✓ ${appCount} applications created`);

  // ---- 料金表データ ----
  const priceCategories = [
    { category: "営業", subcategories: [["法人営業", 300000, 200000], ["インサイドセールス", 280000, 180000], ["ルート営業", 260000, 160000]] },
    { category: "IT", subcategories: [["エンジニア（経験3年〜）", 500000, null], ["エンジニア（経験1〜3年）", 400000, 300000], ["未経験エンジニア", null, 200000]] },
    { category: "コーポレートスタッフ", subcategories: [["人事・労務", 280000, 180000], ["経理・財務", 300000, 180000], ["総務・法務", 260000, 160000]] },
    { category: "企画/マーケティング", subcategories: [["マーケター（経験者）", 380000, null], ["企画スタッフ", 300000, 200000]] },
    { category: "医療/介護/福祉", subcategories: [["介護福祉士", 250000, 180000], ["看護師", 350000, null]] },
    { category: "製造/物流/軽作業", subcategories: [["生産管理", 280000, 180000], ["倉庫・物流", 200000, 150000]] },
  ];

  let sortOrder = 0;
  for (let ci = 0; ci < priceCategories.length; ci++) {
    const cat = priceCategories[ci]!;
    for (const [sub, expPrice, unexpPrice] of cat.subcategories as [string, number | null, number | null][]) {
      await prisma.priceEntry.create({
        data: {
          category: cat.category,
          subcategory: sub,
          experiencedPrice: expPrice ?? 0,
          inexperiencedPrice: unexpPrice,
          sortOrder: sortOrder++,
          categorySortOrder: ci,
        },
      });
    }
  }
  console.log("✓ PriceEntry data created");

  console.log("\n=== Staging seed complete ===");
  console.log("管理者:  admin@staging.kyujin-ch.jp / Admin1234!");
  console.log("企業:    company1〜50@staging-test.jp / Company1234!");
  console.log("求職者:  user1〜50@staging-test.jp / User1234!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
