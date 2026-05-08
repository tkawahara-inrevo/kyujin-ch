import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const companies = [
  {
    name: "株式会社テックブリッジ",
    corporateNumber: "1234567890001",
    description: "ITシステム開発・コンサルティング。福岡に本社を持つSIer。",
    location: "福岡県福岡市博多区",
    prefecture: "福岡県",
    city: "福岡市博多区",
    email: "seed_techbridge@kyujin-test.invalid",
    lastName: "田中",
    firstName: "健一",
  },
  {
    name: "株式会社マーケティングラボ",
    corporateNumber: "1234567890002",
    description: "デジタルマーケティング支援。広告運用からSEO対策まで幅広く対応。",
    location: "東京都渋谷区",
    prefecture: "東京都",
    city: "渋谷区",
    email: "seed_mktlab@kyujin-test.invalid",
    lastName: "佐藤",
    firstName: "美咲",
  },
  {
    name: "株式会社グリーンケア",
    corporateNumber: "1234567890003",
    description: "医療・介護サービスを展開。九州エリアを中心に20施設以上を運営。",
    location: "福岡県北九州市",
    prefecture: "福岡県",
    city: "北九州市",
    email: "seed_greencare@kyujin-test.invalid",
    lastName: "山本",
    firstName: "直子",
  },
  {
    name: "株式会社クリエイトデザイン",
    corporateNumber: "1234567890004",
    description: "UI/UXデザイン・ブランディングを手掛ける制作会社。",
    location: "東京都港区",
    prefecture: "東京都",
    city: "港区",
    email: "seed_createdesign@kyujin-test.invalid",
    lastName: "鈴木",
    firstName: "翔太",
  },
  {
    name: "株式会社アシストセールス",
    corporateNumber: "1234567890005",
    description: "法人向けSaaS営業・セールスコンサルティング。",
    location: "大阪府大阪市北区",
    prefecture: "大阪府",
    city: "大阪市北区",
    email: "seed_assistsales@kyujin-test.invalid",
    lastName: "高橋",
    firstName: "雄介",
  },
];

const jobTemplates = [
  // IT系（5件）
  {
    companyIndex: 0,
    title: "バックエンドエンジニア（Java/Spring Boot）",
    categoryTag: "IT",
    employmentType: "FULL_TIME",
    location: "福岡県福岡市博多区",
    region: "九州・沖縄",
    salaryMin: 4000000,
    salaryMax: 6000000,
    description: "Javaを用いたWebアプリケーションのバックエンド開発をお任せします。Spring Bootを使ったREST API設計・実装が主な業務です。",
    requirements: "Java経験2年以上。Spring Boot経験者歓迎。",
    tags: ["Java", "Spring Boot", "AWS", "バックエンド"],
  },
  {
    companyIndex: 0,
    title: "フロントエンドエンジニア（React/TypeScript）",
    categoryTag: "IT",
    employmentType: "FULL_TIME",
    location: "福岡県福岡市博多区",
    region: "九州・沖縄",
    salaryMin: 3800000,
    salaryMax: 5600000,
    description: "React/TypeScriptを使ったWebフロントエンド開発。自社サービスの画面開発をメインにお任せします。",
    requirements: "React経験1年以上。TypeScript経験者優遇。",
    tags: ["React", "TypeScript", "Next.js", "フロントエンド"],
  },
  {
    companyIndex: 0,
    title: "インフラエンジニア（AWS）",
    categoryTag: "IT",
    employmentType: "FULL_TIME",
    location: "福岡県福岡市博多区",
    region: "九州・沖縄",
    salaryMin: 4200000,
    salaryMax: 6500000,
    description: "AWSを中心としたクラウドインフラの設計・構築・運用。IaCを活用した自動化推進にも取り組んでいます。",
    requirements: "AWS経験2年以上。Terraform経験者歓迎。",
    tags: ["AWS", "Terraform", "インフラ", "クラウド"],
  },
  {
    companyIndex: 3,
    title: "Webエンジニア（フルスタック）",
    categoryTag: "IT",
    employmentType: "FULL_TIME",
    location: "東京都港区",
    region: "関東",
    salaryMin: 4500000,
    salaryMax: 7000000,
    description: "デザイン会社の内製開発チームとして、受託Webサービスの設計・開発をフルスタックで担当します。",
    requirements: "フロント・バックともに実務経験3年以上。",
    tags: ["フルスタック", "Node.js", "React", "PostgreSQL"],
  },
  {
    companyIndex: 1,
    title: "データエンジニア（BIツール・SQL）",
    categoryTag: "IT",
    employmentType: "FULL_TIME",
    location: "東京都渋谷区",
    region: "関東",
    salaryMin: 4300000,
    salaryMax: 6200000,
    description: "マーケティングデータの収集・加工・可視化基盤の構築。BIダッシュボードの設計・運用も担当します。",
    requirements: "SQL上級。BIツール（Tableau/Looker等）経験者優遇。",
    tags: ["SQL", "BigQuery", "Looker", "データ分析"],
  },
  // 営業系（4件）
  {
    companyIndex: 4,
    title: "法人営業（SaaS・インサイドセールス）",
    categoryTag: "営業",
    employmentType: "FULL_TIME",
    location: "大阪府大阪市北区",
    region: "近畿",
    salaryMin: 3500000,
    salaryMax: 5000000,
    description: "法人向けSaaSプロダクトのインサイドセールス。電話・メール・Web会議を通じた商談対応がメイン。",
    requirements: "営業経験1年以上。SaaS業界経験者優遇。",
    tags: ["インサイドセールス", "SaaS", "BtoB", "法人営業"],
  },
  {
    companyIndex: 4,
    title: "フィールドセールス（中小企業向け）",
    categoryTag: "営業",
    employmentType: "FULL_TIME",
    location: "大阪府大阪市北区",
    region: "近畿",
    salaryMin: 3300000,
    salaryMax: 4800000,
    description: "中小企業を対象とした訪問・提案型の営業。新規開拓と既存フォローを半々でお任せします。",
    requirements: "法人営業経験者。未経験でもポテンシャル採用あり。",
    tags: ["フィールドセールス", "新規開拓", "法人営業"],
  },
  {
    companyIndex: 1,
    title: "広告営業（運用型広告）",
    categoryTag: "営業",
    employmentType: "FULL_TIME",
    location: "東京都渋谷区",
    region: "関東",
    salaryMin: 3600000,
    salaryMax: 5200000,
    description: "Web広告（Google/Meta）の運用提案から効果改善までを担当。クライアントのROI向上を一緒に目指します。",
    requirements: "広告運用の基礎知識がある方。営業経験者優遇。",
    tags: ["広告営業", "Google広告", "Meta広告", "デジタルマーケ"],
  },
  {
    companyIndex: 4,
    title: "カスタマーサクセス（CS）",
    categoryTag: "営業",
    employmentType: "FULL_TIME",
    location: "大阪府大阪市北区",
    region: "近畿",
    salaryMin: 3400000,
    salaryMax: 4900000,
    description: "SaaSプロダクト導入後のオンボーディング、活用支援、解約防止を担う。顧客との長期的なパートナーシップを構築。",
    requirements: "カスタマーサポートまたはCS経験者。",
    tags: ["カスタマーサクセス", "SaaS", "オンボーディング"],
  },
  // デザイナー系（3件）
  {
    companyIndex: 3,
    title: "UIデザイナー（Figma）",
    categoryTag: "デザイナー",
    employmentType: "FULL_TIME",
    location: "東京都港区",
    region: "関東",
    salaryMin: 3800000,
    salaryMax: 5500000,
    description: "スマートフォンアプリ・WebサービスのUI設計。FigmaによるデザインシステムやコンポーネントのUIデザインをお任せします。",
    requirements: "Figma使用経験。UIデザイン実務2年以上。",
    tags: ["UIデザイン", "Figma", "デザインシステム"],
  },
  {
    companyIndex: 3,
    title: "グラフィックデザイナー（広告・バナー）",
    categoryTag: "デザイナー",
    employmentType: "FULL_TIME",
    location: "東京都港区",
    region: "関東",
    salaryMin: 3000000,
    salaryMax: 4300000,
    description: "Web広告バナー・LPのグラフィックデザイン。Adobe Illustrator/Photoshopを使った制作業務がメインです。",
    requirements: "AdobeCC使用歴2年以上。バナー・LP制作経験者。",
    tags: ["グラフィックデザイン", "Illustrator", "Photoshop", "広告"],
  },
  {
    companyIndex: 1,
    title: "UXリサーチャー",
    categoryTag: "デザイナー",
    employmentType: "FULL_TIME",
    location: "東京都渋谷区",
    region: "関東",
    salaryMin: 4200000,
    salaryMax: 6000000,
    description: "ユーザーインタビュー・ユーザビリティテストの設計・実施・分析。プロダクト改善に向けたインサイト提供がメインです。",
    requirements: "UXリサーチ実務経験1年以上。",
    tags: ["UXリサーチ", "ユーザーインタビュー", "定性調査"],
  },
  // 医療/介護系（3件）
  {
    companyIndex: 2,
    title: "介護福祉士（特別養護老人ホーム）",
    categoryTag: "医療・福祉",
    employmentType: "FULL_TIME",
    location: "福岡県北九州市",
    region: "九州・沖縄",
    salaryMin: 2500000,
    salaryMax: 3200000,
    description: "特養での介護業務全般。入浴・食事・排泄介助のほか、レクリエーション企画なども担当します。",
    requirements: "介護福祉士資格保有者。未取得でもOK（資格取得支援あり）。",
    tags: ["介護", "特養", "介護福祉士", "夜勤あり"],
  },
  {
    companyIndex: 2,
    title: "看護師（有料老人ホーム）",
    categoryTag: "医療・福祉",
    employmentType: "FULL_TIME",
    location: "福岡県北九州市",
    region: "九州・沖縄",
    salaryMin: 3400000,
    salaryMax: 4200000,
    description: "有料老人ホームでの看護業務。バイタルチェック・服薬管理・緊急時対応が中心です。夜勤は月4〜5回程度。",
    requirements: "正看護師または准看護師免許。老人ホーム経験者優遇。",
    tags: ["看護師", "有料老人ホーム", "医療", "夜勤あり"],
  },
  {
    companyIndex: 2,
    title: "ケアマネジャー（居宅介護支援）",
    categoryTag: "医療・福祉",
    employmentType: "FULL_TIME",
    location: "福岡県北九州市",
    region: "九州・沖縄",
    salaryMin: 2900000,
    salaryMax: 3700000,
    description: "居宅支援事業所でのケアプラン作成・モニタリング・各機関との連絡調整。40件程度の担当をお任せします。",
    requirements: "介護支援専門員（ケアマネ）資格保有者。",
    tags: ["ケアマネ", "ケアプラン", "居宅介護支援"],
  },
];

async function main() {
  console.log("テストデータ作成開始...");

  const createdCompanies = [];

  for (const c of companies) {
    const password = await bcrypt.hash("Test1234!", 10);
    const user = await prisma.user.create({
      data: {
        name: `${c.lastName} ${c.firstName}`,
        email: c.email,
        username: `seed_${crypto.randomBytes(4).toString("hex")}`,
        password,
        role: "COMPANY",
        firstName: c.firstName,
        lastName: c.lastName,
        phone: "090-0000-0000",
      },
    });

    const company = await prisma.company.create({
      data: {
        name: c.name,
        corporateNumber: c.corporateNumber,
        description: c.description,
        location: c.location,
        prefecture: c.prefecture,
        city: c.city,
        companyUserId: user.id,
      },
    });

    createdCompanies.push(company);
    console.log(`  企業作成: ${c.name}`);
  }

  for (const t of jobTemplates) {
    const company = createdCompanies[t.companyIndex];
    await prisma.job.create({
      data: {
        companyId: company.id,
        title: t.title,
        description: t.description,
        location: t.location,
        region: t.region,
        salaryMin: t.salaryMin,
        salaryMax: t.salaryMax,
        employmentType: t.employmentType,
        isPublished: true,
        isDeleted: false,
        reviewStatus: "PUBLISHED",
        categoryTag: t.categoryTag,
        tags: t.tags,
        requirements: t.requirements,
      },
    });
    console.log(`  求人作成: ${t.title}`);
  }

  console.log("\n完了！");
  console.log(`企業: ${companies.length}社`);
  console.log(`求人: ${jobTemplates.length}件`);
  console.log(`  IT系: ${jobTemplates.filter(j => j.categoryTag === "IT").length}件`);
  console.log(`  営業系: ${jobTemplates.filter(j => j.categoryTag === "営業").length}件`);
  console.log(`  デザイナー系: ${jobTemplates.filter(j => j.categoryTag === "デザイナー").length}件`);
  console.log(`  医療・福祉系: ${jobTemplates.filter(j => j.categoryTag === "医療・福祉").length}件`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
