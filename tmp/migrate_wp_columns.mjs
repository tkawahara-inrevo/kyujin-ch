import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// WP REST APIからコラム記事を取得
async function fetchWpColumns() {
  const res = await fetch(
    "https://wp.kyujin-ch.jp/wp-json/wp/v2/column?per_page=100&_fields=id,title,content,excerpt,date,featured_media,tags"
  );
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json();
}

// アイキャッチ画像URLを取得
async function fetchMediaUrl(mediaId) {
  if (!mediaId) return null;
  try {
    const res = await fetch(
      `https://wp.kyujin-ch.jp/wp-json/wp/v2/media/${mediaId}?_fields=source_url`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.source_url ?? null;
  } catch {
    return null;
  }
}

// HTMLタグを除去してプレーンテキストに
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

const posts = await fetchWpColumns();
console.log(`WPから${posts.length}件取得`);

for (const post of posts) {
  const title = post.title.rendered;
  const body = post.content.rendered;
  const summary = post.excerpt?.rendered ? stripHtml(post.excerpt.rendered).slice(0, 200) || null : null;
  const publishedAt = new Date(post.date);
  const thumbnailUrl = await fetchMediaUrl(post.featured_media);

  // 既存チェック（タイトル + 公開日で重複防止）
  const existing = await prisma.columnPost.findFirst({
    where: { title, publishedAt },
  });

  if (existing) {
    console.log(`スキップ（既存）: ${title.slice(0, 40)}`);
    continue;
  }

  await prisma.columnPost.create({
    data: {
      title,
      body,
      summary,
      thumbnailUrl,
      tags: [],
      isPublished: true,
      publishedAt,
    },
  });

  console.log(`作成: ${title.slice(0, 40)} / ${thumbnailUrl ? "画像あり" : "画像なし"}`);
}

await prisma.$disconnect();
console.log("完了");
