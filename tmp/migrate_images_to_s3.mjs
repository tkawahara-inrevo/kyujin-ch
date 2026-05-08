import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import https from "https";
import http from "http";
import { URL } from "url";
import path from "path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;
const S3_BASE = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

async function fetchJson(url) {
  const res = await fetch(url, {
    // @ts-ignore
    agent: new https.Agent({ rejectUnauthorized: false }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] ?? "image/jpeg" }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// WP APIからコラム一覧取得
const wpPosts = await fetchJson(
  "https://wp.kyujin-ch.jp/wp-json/wp/v2/column?per_page=100&_fields=id,title,featured_media,date"
);
console.log(`WPから${wpPosts.length}件取得`);

// featured_media → URL マップ
async function getMediaUrl(mediaId) {
  if (!mediaId) return null;
  try {
    const data = await fetchJson(`https://wp.kyujin-ch.jp/wp-json/wp/v2/media/${mediaId}?_fields=source_url`);
    return data.source_url ?? null;
  } catch {
    return null;
  }
}

// DBのコラムを全取得
const dbPosts = await prisma.columnPost.findMany({
  select: { id: true, title: true, thumbnailUrl: true },
});

// titleで突合
const dbByTitle = new Map(dbPosts.map((p) => [p.title, p]));

for (const wp of wpPosts) {
  const title = wp.title.rendered;
  const db = dbByTitle.get(title);
  if (!db) {
    console.log(`DBに見つからない: ${title.slice(0, 40)}`);
    continue;
  }

  const wpImageUrl = await getMediaUrl(wp.featured_media);
  if (!wpImageUrl) {
    console.log(`画像なし: ${title.slice(0, 40)}`);
    continue;
  }

  console.log(`\n処理中: ${title.slice(0, 40)}`);
  console.log(`  WP URL: ${wpImageUrl}`);

  try {
    const { buffer, contentType } = await downloadBuffer(wpImageUrl);
    const ext = path.extname(new URL(wpImageUrl).pathname) || ".jpg";
    const key = `images/columns/${db.id}${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    const newUrl = `${S3_BASE}/${key}`;
    await prisma.columnPost.update({
      where: { id: db.id },
      data: { thumbnailUrl: newUrl },
    });

    console.log(`  → S3: ${newUrl}`);
  } catch (err) {
    console.error(`  エラー: ${err.message}`);
  }
}

await prisma.$disconnect();
console.log("\n完了");
