import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ColumnSidebar } from "@/components/column-sidebar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ id: string }>;

export default async function ColumnDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const post = await prisma.columnPost.findFirst({
    where: { id, isPublished: true },
  });

  if (!post) notFound();

  const date = (post.publishedAt ?? post.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isHtml = post.body.trim().startsWith("<");

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <article className="overflow-hidden rounded-xl bg-white shadow-sm">
            {/* サムネイル */}
            {post.thumbnailUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e8e8]">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  unoptimized={post.thumbnailUrl.includes("wp.kyujin-ch.jp")}
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* タグ */}
              {post.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#eef2f7] px-3 py-1 text-[11px] font-bold text-[#475467]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* タイトル */}
              <h1 className="text-[24px] font-bold leading-[1.45] text-[#1f2937] md:text-[28px]">
                {post.title}
              </h1>

              {/* 日付 */}
              <p className="mt-2 text-[12px] text-[#98a2b3]">{date}</p>

              {/* サマリー */}
              {post.summary && (
                <p className="mt-5 rounded-lg bg-[#f8fafc] p-4 text-[14px] leading-[1.8] text-[#475467]">
                  {post.summary}
                </p>
              )}

              {/* 本文 */}
              <div className="mt-6">
                {isHtml ? (
                  <div
                    className="column-body max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                  />
                ) : (
                  <div className="space-y-4">
                    {post.body.split(/\r?\n/).filter((l) => l.trim()).map((line, idx) => (
                      <p key={idx} className="text-[15px] leading-[1.95] text-[#374151]">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* 戻るリンク */}
              <div className="mt-10 border-t border-[#eee] pt-6">
                <Link href="/column" className="text-[13px] text-[#2f6cff] hover:underline">
                  ← コラム一覧に戻る
                </Link>
              </div>
            </div>
          </article>

          <div className="hidden lg:block">
            <ColumnSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
