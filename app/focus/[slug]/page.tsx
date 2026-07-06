import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { FocusSidebar } from "@/components/focus-sidebar";
import { FocusArticleView } from "@/components/focus-article-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await prisma.focusArticle.findUnique({
    where: { slug },
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
  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  const [article, allArticles] = await Promise.all([
    prisma.focusArticle.findUnique({
      // 管理者は未公開も閲覧可能（プレビュー用途）
      where: isAdmin ? { slug } : { slug, isPublished: true },
    }),
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
  ]);

  if (!article) notFound();

  const allTags = [...new Set(allArticles.flatMap((a) => a.tags))];

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-12">
      {isAdmin && !article.isPublished && (
        <div className="mb-4 rounded-[8px] border border-[#fbbf24] bg-[#fffbeb] px-4 py-2 text-[13px] font-bold text-[#92400e]">
          プレビュー中（未公開）— この表示は管理者のみ閲覧可能です
          <Link href={`/admin/focus/${article.id}`} className="ml-3 text-[#2563eb] hover:underline">編集に戻る →</Link>
        </div>
      )}
      <div className="flex gap-8">
        <FocusArticleView
          slug={slug}
          companyName={article.companyName}
          title={article.title}
          summary={article.summary}
          body={article.body}
          thumbnailUrl={article.thumbnailUrl}
          tags={article.tags}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          authorName={article.authorName}
          authorBio={article.authorBio}
          authorImageUrl={article.authorImageUrl}
        />
        <div className="hidden lg:block">
          <Suspense>
            <FocusSidebar allTags={allTags} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
