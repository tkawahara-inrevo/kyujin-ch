import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "採用お役立ち情報｜求人ちゃんねる",
  description: "採用担当者向けの実務ノウハウ・スカウト運用・採用戦略を解説するコラム。",
};

export default async function BizColumnListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const now = new Date();
  const posts = await prisma.bizColumnPost.findMany({
    where: {
      isPublished: true,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      ...(q
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { body: { contains: q, mode: "insensitive" } },
                ],
              },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  // タグ集計（サイドバー候補）
  const all = await prisma.bizColumnPost.findMany({
    where: { isPublished: true },
    select: { tags: true },
  });
  const allTags = [...new Set(all.flatMap((p) => p.tags))];

  return (
    <main>
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-[#1a3a8f] to-[#2f6cff] px-6 py-12 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[#9ec5ff]">FOR HR</p>
          <h1 className="mt-2 text-[28px] font-bold text-white md:text-[36px]">採用お役立ち情報</h1>
          <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/90">
            採用担当者の悩みを解決する、現場の実務ノウハウ・スカウト運用・採用戦略を発信します。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <section>
            <h2 className="text-[22px] font-bold text-[#222]">
              {tag ? `#${tag}` : q ? `「${q}」の検索結果` : "最新記事"}
            </h2>
            <p className="mt-1 mb-4 text-[12px] text-[#999]">{posts.length}件</p>

            {posts.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-[#9aa3b2] shadow-sm">
                公開中のコラムはまだありません
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {posts.map((post) => (
                  <BizColumnCard key={post.id} post={post} />
                ))}
              </div>
            )}

          </section>

          {/* 右サイドバー */}
          <aside className="hidden lg:block space-y-4">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="mb-3 text-[14px] font-bold text-[#1f2937]">タグから探す</p>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 && <p className="text-[12px] text-[#888]">タグなし</p>}
                {allTags.map((t) => (
                  <Link
                    key={t}
                    href={`/biz-column?tag=${encodeURIComponent(t)}`}
                    className="rounded-full bg-[#1f2775] px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
};

function BizColumnCard({ post }: { post: Post }) {
  const date = (post.publishedAt ?? post.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Link
      href={`/biz-column/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e8e8]">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            unoptimized={!post.thumbnailUrl.includes("s3.ap-northeast-1.amazonaws.com")}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[32px] text-[#ccc]">💼</span>
          </div>
        )}
        {isNew(post.publishedAt ?? post.createdAt) && (
          <span className="absolute right-0 top-0 rounded-bl-[6px] bg-[#1d63e3] px-3 py-[3px] text-[11px] font-semibold text-white">
            新着
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag, i) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-[3px] text-[11px] font-semibold ${
                  i === 0 ? "bg-[#1f2775] text-white" : "bg-[#e5e5e5] text-[#333]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="line-clamp-2 text-[15px] font-bold leading-[1.55] text-[#1f2937]">
          {post.title}
        </p>
        {post.summary && (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.7] text-[#6b7280]">
            {post.summary}
          </p>
        )}
        <p className="mt-auto pt-3 text-right text-[11px] text-[#aaa]">掲載日 {date}</p>
      </div>
    </Link>
  );
}

function isNew(date: Date): boolean {
  return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
}
