import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ColumnListPage() {
  const posts = await prisma.columnPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* メインコンテンツ */}
          <section>
            <h1 className="text-[22px] font-bold text-[#222]">今知りたい！最新就職情報</h1>

            <div className="mt-1 mb-4 text-[12px] text-[#999]">{posts.length}件</div>

            <h2 className="mb-4 text-[15px] font-bold text-[#333]">▼コラム</h2>

            {posts.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-[#9aa3b2] shadow-sm">
                公開中のコラムはまだありません
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {posts.map((post) => (
                  <ColumnCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          {/* 右サイドバー */}
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

type Post = {
  id: string;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
};

function ColumnCard({ post }: { post: Post }) {
  const date = (post.publishedAt ?? post.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Link
      href={`/column/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e8e8]">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[32px] text-[#ccc]">📝</span>
          </div>
        )}
        {/* 新着バッジ（7日以内） */}
        {isNew(post.publishedAt ?? post.createdAt) && (
          <span className="absolute right-2 top-2 rounded-[4px] bg-[#ff3158] px-2 py-[3px] text-[11px] font-bold text-white">
            新着
          </span>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex flex-1 flex-col p-4">
        {/* タグ */}
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eef2f7] px-2.5 py-[3px] text-[10px] font-bold text-[#475467]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* タイトル */}
        <p className="line-clamp-2 text-[15px] font-bold leading-[1.55] text-[#1f2937]">
          {post.title}
        </p>

        {/* サマリー */}
        {post.summary && (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.7] text-[#6b7280]">
            {post.summary}
          </p>
        )}

        {/* 日付 */}
        <p className="mt-auto pt-3 text-right text-[11px] text-[#aaa]">掲載日 {date}</p>
      </div>
    </Link>
  );
}

function isNew(date: Date): boolean {
  return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
}
