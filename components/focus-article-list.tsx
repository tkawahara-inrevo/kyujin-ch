import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FocusArticleCard } from "@/components/focus-article-card";
import { FocusSidebar } from "@/components/focus-sidebar";

type Props = {
  heading: string;
  q?: string;
  tag?: string;
  sort?: "new" | "hot";
};

/**
 * Focus記事一覧 + サイドバーの共有レイアウト。
 * /focus, /focus/new, /focus/hot, /focus/search で再利用。
 */
export async function FocusArticleList({ heading, q, tag, sort }: Props) {
  const where = {
    isPublished: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { companyName: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(sort === "hot" ? { isHot: true } : {}),
  };

  const [articles, allArticles, rankingArticles] = await Promise.all([
    prisma.focusArticle.findMany({
      where,
      orderBy:
        sort === "new"
          ? { publishedAt: "desc" }
          : [{ isHot: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        companyName: true,
        title: true,
        thumbnailUrl: true,
        tags: true,
        publishedAt: true,
        isHot: true,
      },
    }),
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      orderBy: [{ isHot: "desc" }, { publishedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnailUrl: true,
      },
    }),
  ]);

  const allTags = [...new Set(allArticles.flatMap((a) => a.tags))];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-[270px]">
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="mb-6 text-[24px] font-bold text-[#333]">{heading}</h1>

          {articles.length === 0 ? (
            <p className="text-[14px] text-[#888]">記事がありません。</p>
          ) : (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="hidden lg:block">
          <Suspense>
            <FocusSidebar allTags={allTags} ranking={rankingArticles} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
