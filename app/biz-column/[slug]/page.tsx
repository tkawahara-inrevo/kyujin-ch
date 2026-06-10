import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BizColumnCTA } from "@/components/biz-column-cta";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await prisma.bizColumnPost.findFirst({
    where: { slug, isPublished: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
    select: { title: true, metaTitle: true, metaDescription: true, summary: true, thumbnailUrl: true },
  });
  if (!post) return {};
  return {
    title: (post.metaTitle || post.title) + " | 採用お役立ち情報 - 求人ちゃんねる",
    description: post.metaDescription || post.summary || undefined,
    openGraph: { images: post.thumbnailUrl ? [post.thumbnailUrl] : [] },
  };
}

export default async function BizColumnDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const post = await prisma.bizColumnPost.findFirst({
    where: {
      slug,
      isPublished: true,
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    },
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

      {/* toB CTA バー */}
      <div className="bg-[#1f2775] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
          <Link href="/biz-column" className="text-[13px] font-bold text-white hover:underline">
            ← 採用お役立ち情報トップ
          </Link>
          <BizColumnCTA variant="header" />
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <article className="overflow-hidden rounded-xl bg-white shadow-sm">
            {post.thumbnailUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e8e8]">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  unoptimized={!post.thumbnailUrl.includes("s3.ap-northeast-1.amazonaws.com")}
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              {post.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/biz-column?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-[#eef2f7] px-3 py-1 text-[11px] font-bold text-[#475467] hover:bg-[#dbe3ec] transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-[24px] font-bold leading-[1.45] text-[#1f2937] md:text-[28px]">
                {post.title}
              </h1>

              <p className="mt-2 text-[12px] text-[#98a2b3]">{date}</p>

              {post.summary && (
                <p className="mt-5 rounded-lg bg-[#f8fafc] p-4 text-[14px] leading-[1.8] text-[#475467]">
                  {post.summary}
                </p>
              )}

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

              {/* 記事下部 CTA */}
              <BizColumnCTA variant="footer" className="mt-10" />

              <div className="mt-8 border-t border-[#eee] pt-6">
                <Link href="/biz-column" className="text-[13px] text-[#2f6cff] hover:underline">
                  ← 採用お役立ち情報一覧に戻る
                </Link>
              </div>
            </div>
          </article>

          <aside className="hidden lg:block">
            <BizColumnCTA variant="sidebar" />
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
