import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const posts = await prisma.columnPost.findMany({
  orderBy: { publishedAt: "desc" },
  select: { title: true, publishedAt: true, isPublished: true },
});

console.log("合計:", posts.length, "件");
for (const p of posts) {
  const date = p.publishedAt?.toISOString().slice(0, 10) ?? "日付なし";
  const status = p.isPublished ? "公開" : "下書き";
  console.log(` - [${date}] [${status}] ${p.title.slice(0, 50)}`);
}

await prisma.$disconnect();
