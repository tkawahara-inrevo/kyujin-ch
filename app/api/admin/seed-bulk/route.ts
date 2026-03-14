import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 本番投入用の大量テストデータ生成API（一度だけ実行）
// GET /api/admin/seed-bulk?key=seed2026bulk

const CATEGORIES = [
  "営業", "企画/マーケティング", "コーポレートスタッフ", "IT",
  "建築/土木", "不動産", "機械/電気", "化学", "医薬品",
  "交通/運輸", "人材サービス", "コンサルタント", "金融",
  "経理", "クリエイティブ", "販売/サービス", "デザイナー", "食品",
];

const EMPLOYMENT_TYPES: string[] = [
  "FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERN", "OTHER",
];

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const COMPANY_SUFFIXES = [
  "株式会社", "合同会社", "有限会社",
];

const COMPANY_NAMES = [
  "テクノロジー", "ソリューションズ", "イノベーション", "システムズ", "サービス",
  "コンサルティング", "エンジニアリング", "デザイン", "プランニング", "クリエイト",
  "ネットワーク", "デジタル", "ロジスティクス", "ファイナンス", "メディア",
  "コミュニケーション", "マネジメント", "リサーチ", "アドバイザリー", "パートナーズ",
  "グローバル", "フューチャー", "プロダクト", "データ", "ストラテジー",
  "ビジネス", "ヒューマン", "リソース", "マーケット", "アセット",
  "フロンティア", "ブリッジ", "クラウド", "スマート", "ラボ",
];

const FIRST_NAMES = [
  "太郎", "花子", "一郎", "美咲", "健太", "さくら", "翔太", "遥", "大輝", "あかり",
  "蓮", "陽菜", "悠人", "結衣", "颯太", "楓", "奏太", "莉子", "大和", "心春",
  "陸", "芽依", "湊", "凛", "樹", "紬", "律", "咲良", "朝陽", "詩",
];

const LAST_NAMES = [
  "田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "中村", "小林", "山本", "加藤",
  "吉田", "山田", "松本", "井上", "木村", "林", "斎藤", "清水", "山口", "阿部",
  "池田", "橋本", "森", "石川", "前田", "小川", "藤田", "岡田", "後藤", "村上",
];

const TAGS = [
  "未経験歓迎", "中途採用", "急募", "リモート勤務可", "フレックス制",
  "年間休日120日以上", "土日祝休み", "残業少なめ", "研修充実", "資格取得支援",
  "社保完備", "昇給あり", "賞与あり", "交通費支給", "駅チカ",
  "服装自由", "副業OK", "転勤なし", "英語力活かせる", "語学力不問",
];

const JOB_TITLES: Record<string, string[]> = {
  "営業": ["法人営業", "個人営業", "ルート営業", "新規開拓営業", "インサイドセールス", "カスタマーサクセス", "営業マネージャー"],
  "IT": ["Webエンジニア", "インフラエンジニア", "フロントエンドエンジニア", "バックエンドエンジニア", "データエンジニア", "QAエンジニア", "プロジェクトマネージャー"],
  "企画/マーケティング": ["マーケティング担当", "Webマーケティング", "広報担当", "事業企画", "商品企画", "ブランドマネージャー"],
  "デザイナー": ["UI/UXデザイナー", "グラフィックデザイナー", "Webデザイナー", "プロダクトデザイナー", "アートディレクター"],
  "経理": ["経理スタッフ", "財務担当", "管理会計", "経理マネージャー", "税務担当"],
  "コンサルタント": ["経営コンサルタント", "ITコンサルタント", "戦略コンサルタント", "人事コンサルタント", "財務アドバイザー"],
  "販売/サービス": ["店長候補", "販売スタッフ", "カスタマーサポート", "接客スタッフ", "バイヤー"],
  "金融": ["ファイナンシャルプランナー", "融資担当", "リスク管理", "投資アドバイザー", "保険営業"],
  "建築/土木": ["施工管理", "設計担当", "現場監督", "建築士", "CADオペレーター"],
  "不動産": ["不動産営業", "プロパティマネジメント", "仲介営業", "不動産管理", "アセットマネージャー"],
  "機械/電気": ["機械設計", "電気設計", "制御設計", "生産技術", "品質管理"],
  "化学": ["研究開発", "品質管理", "生産管理", "分析担当", "製品開発"],
  "医薬品": ["MR", "臨床開発", "薬事担当", "品質保証", "メディカルライター"],
  "交通/運輸": ["物流管理", "配送ドライバー", "倉庫管理", "運行管理", "ロジスティクス企画"],
  "人材サービス": ["キャリアアドバイザー", "リクルーティングコンサルタント", "採用担当", "人材コーディネーター"],
  "コーポレートスタッフ": ["人事担当", "総務担当", "法務担当", "内部監査", "秘書"],
  "クリエイティブ": ["映像ディレクター", "コピーライター", "編集者", "フォトグラファー", "プロデューサー"],
  "食品": ["食品開発", "品質管理", "生産管理", "商品企画", "フードコーディネーター"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== "seed2026bulk") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // ====== 1. 企業350社 ======
    console.log("Creating 350 companies...");
    const companyIds: string[] = [];
    const usedCompanyNames = new Set<string>();

    for (let i = 0; i < 350; i++) {
      let name: string;
      do {
        const prefix = pick(["", "新", "東", "西", "南", "北", "日本", "東京", "大阪", "福岡", "総合", "第一", "共同", "中央", "太平洋"]);
        const core = pick(COMPANY_NAMES);
        const suffix = pick(COMPANY_SUFFIXES);
        name = suffix === "株式会社"
          ? `${suffix}${prefix}${core}`
          : `${prefix}${core}${suffix}`;
      } while (usedCompanyNames.has(name));
      usedCompanyNames.add(name);

      const loc = pick(PREFECTURES);
      const createdAt = randomDate(new Date("2025-01-01"), new Date("2026-03-14"));

      const company = await prisma.company.create({
        data: {
          name,
          description: `${loc}を拠点に事業展開する企業です。`,
          websiteUrl: `https://example-${i}.com`,
          location: loc,
          createdAt,
          updatedAt: createdAt,
        },
      });
      companyIds.push(company.id);

      if ((i + 1) % 50 === 0) console.log(`  Companies: ${i + 1}/350`);
    }

    // ====== 2. 求職者300人 ======
    console.log("Creating 300 job seekers...");
    const userIds: string[] = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < 300; i++) {
      const lastName = pick(LAST_NAMES);
      const firstName = pick(FIRST_NAMES);
      let email: string;
      do {
        const suffix = randomInt(1, 9999);
        email = `user${i}_${suffix}@test.example.com`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const createdAt = randomDate(new Date("2025-03-01"), new Date("2026-03-14"));

      const user = await prisma.user.create({
        data: {
          name: `${lastName} ${firstName}`,
          email,
          password: hashedPassword,
          role: "USER",
          phone: `090-${String(randomInt(1000, 9999))}-${String(randomInt(1000, 9999))}`,
          createdAt,
          updatedAt: createdAt,
        },
      });
      userIds.push(user.id);

      if ((i + 1) % 50 === 0) console.log(`  Users: ${i + 1}/300`);
    }

    // ====== 3. 求人1000件 ======
    console.log("Creating 1000 jobs...");
    const jobRecords: { id: string; companyId: string; createdAt: Date; categoryTag: string }[] = [];

    for (let i = 0; i < 1000; i++) {
      const companyId = pick(companyIds);
      const category = pick(CATEGORIES);
      const titles = JOB_TITLES[category] || ["スタッフ"];
      const titleBase = pick(titles);
      const tags = pickN(TAGS, randomInt(1, 4));
      const loc = pick(PREFECTURES);
      const employmentType = pick(EMPLOYMENT_TYPES);
      const targetType = pick(["NEW_GRAD", "NEW_GRAD", "MID_CAREER", "MID_CAREER", "MID_CAREER"]);
      const graduationYear = targetType === "NEW_GRAD" ? pick([2027, 2028]) : null;
      const salaryMin = pick([null, 200, 250, 300, 350, 400, 450, 500]);
      const salaryMax = salaryMin ? salaryMin + randomInt(50, 300) : null;
      const viewCount = randomInt(0, 5000);
      const createdAt = randomDate(new Date("2025-06-01"), new Date("2026-03-14"));

      const job = await prisma.job.create({
        data: {
          companyId,
          title: `【${pick(["未経験歓迎", "経験者優遇", "急募", "積極採用中", "高待遇"])}】${titleBase}募集`,
          description: `${category}分野で活躍できる${titleBase}を募集しています。やりがいのある仕事で、あなたの力を発揮してください。`,
          location: loc,
          salaryMin,
          salaryMax,
          employmentType: employmentType as any,
          isPublished: Math.random() > 0.05,
          categoryTag: category,
          tags,
          viewCount,
          targetType,
          graduationYear,
          createdAt,
          updatedAt: createdAt,
        },
      });
      jobRecords.push({ id: job.id, companyId, createdAt, categoryTag: category });

      if ((i + 1) % 100 === 0) console.log(`  Jobs: ${i + 1}/1000`);
    }

    // ====== 4. PVデータ (求人のviewCountに基づいてJobViewレコード作成 - 上位100求人分) ======
    console.log("Creating job views...");
    const topJobs = jobRecords.slice(0, 100);
    let viewsCreated = 0;
    for (const job of topJobs) {
      const viewCount = randomInt(5, 30);
      const viewData = [];
      for (let v = 0; v < viewCount; v++) {
        viewData.push({
          jobId: job.id,
          viewedAt: randomDate(job.createdAt, new Date("2026-03-14")),
          sessionId: `sess_${randomInt(10000, 99999)}`,
        });
      }
      await prisma.jobView.createMany({ data: viewData });
      viewsCreated += viewCount;
    }
    console.log(`  JobViews: ${viewsCreated}`);

    // ====== 5. 応募500件 ======
    console.log("Creating 500 applications...");
    const applicationRecords: { id: string; jobId: string; companyId: string; createdAt: Date }[] = [];
    const usedPairs = new Set<string>();
    let appCreated = 0;

    while (appCreated < 500) {
      const userId = pick(userIds);
      const jobRec = pick(jobRecords);
      const pairKey = `${userId}_${jobRec.id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const appDate = randomDate(
        new Date(Math.max(jobRec.createdAt.getTime(), new Date("2025-08-01").getTime())),
        new Date("2026-03-14")
      );
      const status = pick(["APPLIED", "APPLIED", "REVIEWING", "REVIEWING", "INTERVIEW", "OFFER", "REJECTED", "HIRED"]);

      const app = await prisma.application.create({
        data: {
          userId,
          jobId: jobRec.id,
          motivation: "この求人に興味があり、自分のスキルを活かせると考え応募しました。",
          status: status as any,
          createdAt: appDate,
          updatedAt: appDate,
        },
      });
      applicationRecords.push({ id: app.id, jobId: jobRec.id, companyId: jobRec.companyId, createdAt: appDate });
      appCreated++;

      if (appCreated % 50 === 0) console.log(`  Applications: ${appCreated}/500`);
    }

    // ====== 6. 課金データ (応募の70%に課金) ======
    console.log("Creating charges...");
    let chargesCreated = 0;
    for (const app of applicationRecords) {
      if (Math.random() > 0.7) continue;

      const billingMonth = `${app.createdAt.getFullYear()}-${String(app.createdAt.getMonth() + 1).padStart(2, "0")}`;
      const amount = pick([30000, 50000, 80000, 100000, 120000, 150000, 200000]);

      await prisma.charge.create({
        data: {
          applicationId: app.id,
          amount,
          isValid: Math.random() > 0.05,
          billingMonth,
          createdAt: app.createdAt,
        },
      });
      chargesCreated++;
    }
    console.log(`  Charges: ${chargesCreated}`);

    // ====== 7. 口コミデータ (一部) ======
    console.log("Creating reviews...");
    const usedReviewPairs = new Set<string>();
    let reviewsCreated = 0;
    for (let i = 0; i < 100; i++) {
      const userId = pick(userIds);
      const companyId = pick(companyIds);
      const pairKey = `${userId}_${companyId}`;
      if (usedReviewPairs.has(pairKey)) continue;
      usedReviewPairs.add(pairKey);

      await prisma.review.create({
        data: {
          userId,
          companyId,
          rating: randomInt(1, 5),
          title: pick(["とても良い職場", "成長できる環境", "待遇が充実", "風通しが良い", "働きやすい会社"]),
          body: "実際に働いてみて感じた率直な感想です。",
          createdAt: randomDate(new Date("2025-06-01"), new Date("2026-03-14")),
        },
      });
      reviewsCreated++;
    }
    console.log(`  Reviews: ${reviewsCreated}`);

    return NextResponse.json({
      success: true,
      created: {
        companies: companyIds.length,
        users: userIds.length,
        jobs: jobRecords.length,
        jobViews: viewsCreated,
        applications: applicationRecords.length,
        charges: chargesCreated,
        reviews: reviewsCreated,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
