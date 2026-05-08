/**
 * 企業アカウント一括登録スクリプト
 * 使い方（本番サーバーで）:
 *   cd /home/ubuntu/kyujin-ch
 *   set -a && source .env 2>/dev/null; set +a
 *   node tmp/bulk_register_companies.mjs
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { config } from "dotenv";

config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const ses = new SESv2Client({
  region: process.env.AWS_REGION ?? "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL ?? "kyujin-ch@inrevo.jp";
const LOGIN_URL = `${process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp"}/company/login`;

function generatePassword() {
  return crypto.randomBytes(6).toString("base64url");
}

function generateUsername(companyName) {
  const base = companyName
    .normalize("NFKC")
    .replace(/[^\w]/g, "")
    .toLowerCase()
    .slice(0, 10);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base || "company"}${suffix}`;
}

async function sendAccountEmail(email, contactName, password) {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: "【求人ちゃんねる】アカウントが発行されました", Charset: "UTF-8" },
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `<p>${contactName} 様</p>
<p>この度は求人ちゃんねるへのお申し込みをいただきありがとうございます。</p>
<p>企業アカウントを発行いたしました。<br>以下の情報でログインしてください。</p>
<br>
<p>【ログイン情報】</p>
<p>ログインURL: <a href="${LOGIN_URL}">${LOGIN_URL}</a><br>
メールアドレス: ${email}<br>
仮パスワード: ${password}</p>
<br>
<p>初回ログイン後、パスワードを変更してください。</p>
<br>
<p>求人ちゃんねる 運営事務局</p>`,
            },
            Text: {
              Charset: "UTF-8",
              Data: `${contactName} 様\n\nこの度は求人ちゃんねるへのお申し込みをいただきありがとうございます。\n\n企業アカウントを発行いたしました。以下の情報でログインしてください。\n\n【ログイン情報】\nログインURL: ${LOGIN_URL}\nメールアドレス: ${email}\n仮パスワード: ${password}\n\n初回ログイン後、パスワードを変更してください。\n\n求人ちゃんねる 運営事務局`,
            },
          },
        },
      },
    })
  );
}

// 登録対象企業リスト
const COMPANIES = [
  { name: "石橋青果株式会社",               email: "saiyo-inrevo@i-veg.jp",                   phone: "05-2681-1484",   lastName: "石川", firstName: "俊介" },
  { name: "大阪銘板株式会社",               email: "recruit-daimei@daimei.jp",                 phone: "06-6745-6309",   lastName: "南保", firstName: "敦彦" },
  { name: "株式会社M&U agency",             email: "recruitment_1@muagency.net",               phone: "090-2423-4863",  lastName: "内田", firstName: "憲樹" },
  { name: "株式会社ベストプランニング",     email: "bp-app-reception@bestbridal.co.jp",        phone: "03-6747-2137",   lastName: "堀",   firstName: "弘子" },
  { name: "株式会社エコプラスワン",         email: "jinji@ecoplusone.com",                     phone: "079-441-7791",   lastName: "渡邉", firstName: "英人" },
  { name: "奈良日産自動車株式会社",         email: "m-kyomori@nara-nissan.co.jp",              phone: "080-3799-9462",  lastName: "京森", firstName: "誠" },
  { name: "株式会社YC",                     email: "yumi1208yuzu@gmail.com",                   phone: "090-4766-0522",  lastName: "櫻田", firstName: "友美" },
  { name: "株式会社One&Only",              email: "nonaka.one.only.recruit@gmail.com",         phone: "03-3332-3657",   lastName: "野中", firstName: "隆太郎" },
  { name: "保坂工務店株式会社",             email: "hosaka-jinji@grace.ocn.ne.jp",             phone: "028-662-1465",   lastName: "木村", firstName: "耕二" },
  { name: "株式会社當木工事",               email: "michiyasu-suzuki@atsuki-koji.co.jp",       phone: "03-3832-1929",   lastName: "池田", firstName: "将志" },
  { name: "野川商事株式会社",               email: "saiyo-gas@ngw.co.jp",                      phone: "023-653-4151",   lastName: "高田", firstName: "啓一" },
  { name: "株式会社クリケン",               email: "kuriken-recruit@kurimoto-gr.co.jp",        phone: "082-292-2355",   lastName: "砂子", firstName: "咲" },
  { name: "株式会社味作家",                 email: "tenmai.inrevo@gmail.com",                  phone: "03-3717-6388",   lastName: "塩津", firstName: "孝之" },
  { name: "富士化学株式会社",               email: "recruit@fuji-chemical.co.jp",              phone: "06-6358-0185",   lastName: "田中", firstName: "寿樹" },
  { name: "株式会社センダイ工部コンサルタント", email: "saiyo@sendaikoubu.co.jp",              phone: "073-462-0678",   lastName: "鈴木", firstName: "佳人" },
  { name: "風越建設株式会社",               email: "t-ishizawa@fuetsu.co.jp",                  phone: "fuetsu5071",     lastName: "石澤", firstName: "剛" },
  { name: "株式会社トライネット",           email: "recruit@try-net.co.jp",                    phone: "0265-24-9320",   lastName: "林",   firstName: "厚志" },
];

async function main() {
  console.log(`登録対象: ${COMPANIES.length} 社`);
  console.log(`ログインURL: ${LOGIN_URL}\n`);

  const results = [];

  for (const co of COMPANIES) {
    const contactName = `${co.lastName} ${co.firstName}`;

    // 既存メールチェック
    const existing = await prisma.user.findUnique({
      where: { email: co.email },
      select: { id: true },
    });
    if (existing) {
      console.log(`SKIP (登録済み): ${co.name} <${co.email}>`);
      results.push({ name: co.name, email: co.email, password: "-", status: "SKIP" });
      continue;
    }

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    let username = generateUsername(co.name);
    while (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
      username = generateUsername(co.name);
    }

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: contactName,
            email: co.email,
            username,
            password: hashedPassword,
            role: "COMPANY",
            lastName: co.lastName,
            firstName: co.firstName,
            phone: co.phone,
          },
        });
        await tx.company.create({
          data: {
            name: co.name,
            companyUserId: user.id,
          },
        });
      });

      await sendAccountEmail(co.email, contactName, password);

      console.log(`OK: ${co.name} | ${co.email} | ${password}`);
      results.push({ name: co.name, email: co.email, password, status: "OK" });
    } catch (err) {
      console.error(`ERROR: ${co.name}`, err.message);
      results.push({ name: co.name, email: co.email, password: "-", status: `ERROR: ${err.message}` });
    }
  }

  console.log("\n" + "=".repeat(100));
  console.log("【結果サマリー（管理用メモ）】");
  console.log("=".repeat(100));
  console.log("会社名\t\t\t\t\tメールアドレス\t\t\t\tパスワード\tステータス");
  console.log("-".repeat(100));
  for (const r of results) {
    const nameCol = r.name.padEnd(28);
    const emailCol = r.email.padEnd(38);
    console.log(`${nameCol}${emailCol}${r.password}\t${r.status}`);
  }
  console.log("=".repeat(100));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
