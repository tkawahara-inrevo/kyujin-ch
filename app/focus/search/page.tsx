import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FocusArticleList } from "@/components/focus-article-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "カテゴリー・検索" };

type SearchParams = Promise<{ q?: string; tag?: string }>;

export default async function FocusSearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, tag } = await searchParams;

  // 全タグを集計
  const all = await prisma.focusArticle.findMany({
    where: { isPublished: true },
    select: { tags: true },
  });
  const allTags = [...new Set(all.flatMap((a) => a.tags))];

  const heading = tag ? `#${tag}` : q ? `「${q}」の検索結果` : "カテゴリーから探す";

  return (
    <div>
      {/* カテゴリ（タグ）一覧 */}
      {!q && !tag && (
        <div className="mx-auto max-w-[1280px] px-6 pt-10 md:px-12">
          <div className="mb-2 h-[5px] w-[50px] bg-[#1f2775]" />
          <h1 className="mb-5 text-[24px] font-bold text-[#333]">カテゴリーから探す</h1>
          <div className="flex flex-wrap gap-[8px]">
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/focus/search?tag=${encodeURIComponent(t)}`}
                className="rounded-full bg-[#333] px-[18px] py-[6px] text-[13px] font-semibold text-white transition hover:opacity-80"
              >
                {t}
              </Link>
            ))}
            {allTags.length === 0 && <p className="text-[14px] text-[#888]">タグがありません。</p>}
          </div>
        </div>
      )}

      {/* 検索結果（タグまたはキーワード指定時のみ記事を表示） */}
      {(q || tag) && <FocusArticleList heading={heading} q={q} tag={tag} />}
    </div>
  );
}
