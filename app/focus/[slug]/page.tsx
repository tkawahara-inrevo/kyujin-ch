import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FocusSidebar } from "@/components/focus-sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await prisma.focusArticle.findUnique({
    where: { slug, isPublished: true },
    select: { title: true, companyName: true, summary: true, thumbnailUrl: true },
  });
  if (!article) return {};
  return {
    title: `${article.title}｜${article.companyName}`,
    description: article.summary || undefined,
    openGraph: { images: article.thumbnailUrl ? [article.thumbnailUrl] : [] },
  };
}

export default async function FocusArticlePage({ params }: { params: Params }) {
  const { slug } = await params;

  const [article, allArticles] = await Promise.all([
    prisma.focusArticle.findUnique({
      where: { slug, isPublished: true },
    }),
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
  ]);

  if (!article) notFound();

  const allTags = [...new Set(allArticles.flatMap((a) => a.tags))];
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, "/")
    : "";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-[270px]">
      <div className="flex gap-8">
        {/* 記事本文エリア */}
        <article className="flex-1 min-w-0">
          {/* メタ情報 */}
          <p className="text-[16px] font-bold text-[#333]">{dateStr}</p>
          <p className="mt-1 text-[16px] font-bold text-[#333]">{article.companyName}</p>
          <h1 className="mt-3 text-[36px] font-bold leading-[1.3] text-[#333]">
            {article.title}
          </h1>

          {/* タグ */}
          {article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-[5px]">
              {article.tags.map((tag, i) => (
                <Link
                  key={tag}
                  href={`/focus?tag=${encodeURIComponent(tag)}`}
                  className={`flex h-[20px] items-center rounded-full px-[15px] text-[12px] font-semibold tracking-[-0.24px] ${
                    i === 0 ? "bg-[#333] text-white" : "bg-[#e5e5e5] text-[#333]"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* 区切り線 */}
          <div className="my-6 border-t border-[#eee]" />

          {/* サムネイル + 目次 */}
          <div className="flex flex-col gap-5 md:flex-row">
            {article.thumbnailUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-[#e3e3e3] md:flex-1">
                <Image
                  src={article.thumbnailUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  unoptimized={!article.thumbnailUrl.includes("s3.ap-northeast-1.amazonaws.com")}
                />
              </div>
            )}

            {/* 概要 */}
            {article.summary && (
              <div className="rounded-[10px] bg-[#f4f4f4] p-[10px] text-[14px] leading-relaxed text-[#333] md:flex-1">
                {article.summary}
              </div>
            )}
          </div>

          {/* 本文 */}
          <div className="mt-8">
            <div
              className="focus-article-body"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </div>

          {/* 区切り線 */}
          <div className="my-8 border-t border-[#eee]" />

          {/* 著者カード */}
          {article.authorName && (
            <div className="rounded-[15px] border border-[#ccc] bg-white/80 p-5">
              <p className="text-[14px] font-semibold text-[#333]">この記事の執筆者</p>
              <div className="mt-3 flex gap-4">
                <div className="flex-1 text-[14px] text-[#333]">
                  <p className="font-bold text-[16px]">{article.authorName}</p>
                  {article.authorBio && (
                    <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-line">
                      {article.authorBio}
                    </p>
                  )}
                </div>
                {article.authorImageUrl && (
                  <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-[10px]">
                    <Image
                      src={article.authorImageUrl}
                      alt={article.authorName}
                      fill
                      className="object-cover"
                      sizes="90px"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SNSシェア */}
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://kyujin-ch.jp/focus/${slug}`)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-[26px] items-center rounded-[5px] bg-black px-2 text-[12px] font-bold text-white"
            >
              ポスト
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://kyujin-ch.jp/focus/${slug}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-[26px] items-center rounded-[5px] bg-[#0031cb] px-2 text-[12px] font-bold text-white"
            >
              シェア
            </a>
          </div>

          {/* 記事一覧に戻る */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/focus"
              className="flex h-[60px] w-[310px] items-center justify-center rounded-full bg-[#1d63e3] text-[16px] font-bold text-white transition hover:opacity-90"
            >
              記事一覧に戻る
            </Link>
          </div>
        </article>

        {/* サイドバー */}
        <div className="hidden lg:block">
          <Suspense>
            <FocusSidebar allTags={allTags} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
