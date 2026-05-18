import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FocusArticleCard } from "@/components/focus-article-card";
import { FocusSidebar } from "@/components/focus-sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Promise<{
  q?: string;
  tag?: string;
  sort?: string;
}>;

export default async function FocusTopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, tag, sort } = await searchParams;

  // 検索条件
  const where = {
    isPublished: true,
    ...(q ? {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { companyName: { contains: q, mode: "insensitive" as const } },
        { summary: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(sort === "hot" ? { isHot: true } : {}),
  };

  const [articles, pickUp, allArticles] = await Promise.all([
    prisma.focusArticle.findMany({
      where,
      orderBy: sort === "new"
        ? { publishedAt: "desc" }
        : [{ isHot: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true, slug: true, companyName: true, title: true,
        thumbnailUrl: true, tags: true, publishedAt: true, isHot: true,
      },
    }),
    // ヒーローエリアのPICK UP記事
    prisma.focusArticle.findFirst({
      where: { isPublished: true, isHot: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, companyName: true, title: true, thumbnailUrl: true },
    }),
    // サイドバー用全タグ
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
  ]);

  const allTags = [...new Set(allArticles.flatMap((a) => a.tags))];

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-[#1f2775] px-6 py-12 md:px-[270px]">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <div>
              {/* ロゴ：紺背景なので白背景のコンテナに収めて視認性を確保 */}
              <div className="inline-block rounded-xl bg-white px-5 py-3">
                <Image
                  src="/assets/Focus_ロゴ@2x.png"
                  alt="Focus"
                  height={50}
                  width={188}
                  className="h-12.5 w-auto"
                  priority
                />
              </div>
              <p className="mt-5 text-[14px] font-bold text-white leading-relaxed">
                『Focus』は一社一社の魅力やストーリーにスポットライトを当て、<br />
                想いを紡ぐインタビューを通じてその価値を発信します。
              </p>
            </div>
          </div>

          {/* PICK UP */}
          {pickUp && (
            <Link
              href={`/focus/${pickUp.slug}`}
              className="relative flex w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_12.5px_rgba(0,0,0,0.5)] md:w-[430px]"
            >
              <div className="relative h-[200px] w-full bg-[#e3e3e3]">
                {pickUp.thumbnailUrl ? (
                  <Image
                    src={pickUp.thumbnailUrl}
                    alt={pickUp.title}
                    fill
                    className="object-cover"
                    sizes="430px"
                    unoptimized
                  />
                ) : null}
                <div className="absolute right-0 top-0 z-10">
                  <div className="relative flex items-center px-3 py-1">
                    <div className="absolute inset-0 bg-white" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%, 20% 0)" }} />
                    <span className="relative text-[12px] font-semibold text-[#1f2775]">PICK UP</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-b from-white/50 to-white px-6 py-3">
                <p className="text-[14px] text-[#333]">{pickUp.companyName}</p>
                <p className="text-[18px] font-semibold text-[#333] leading-[1.3] tracking-tight">
                  {pickUp.title}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-[270px]">
        <div className="flex gap-8">
          {/* 記事一覧 */}
          <div className="flex-1 min-w-0">
            <h2 className="mb-6 text-[24px] font-bold text-[#333]">
              {tag ? `#${tag}` : q ? `"${q}" の検索結果` : "記事一覧"}
            </h2>

            {articles.length === 0 ? (
              <p className="text-[14px] text-[#888]">記事がありません。</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <FocusArticleCard
                    key={article.id}
                    slug={article.slug}
                    title={article.title}
                    companyName={article.companyName}
                    thumbnailUrl={article.thumbnailUrl}
                    tags={article.tags}
                    publishedAt={article.publishedAt}
                    isHot={article.isHot}
                  />
                ))}
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="hidden lg:block">
            <Suspense>
              <FocusSidebar allTags={allTags} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
