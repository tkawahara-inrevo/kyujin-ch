import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FocusArticleList } from "@/components/focus-article-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "記事一覧" };

type SearchParams = Promise<{ q?: string; tag?: string }>;

export default async function FocusTopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, tag } = await searchParams;

  const pickUp = await prisma.focusArticle.findFirst({
    where: { isPublished: true, isHot: true },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, companyName: true, title: true, thumbnailUrl: true },
  });

  const heading = tag ? `#${tag}` : q ? `「${q}」の検索結果` : "記事一覧";

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-[#1f2775] px-6 py-12 md:px-[270px]">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <Image
                src="/assets/Focus-fv.png"
                alt="Focus"
                height={138}
                width={388}
                className="h-34.5 w-auto max-w-full"
                priority
              />
              <p className="mt-5 text-[14px] font-bold leading-relaxed text-white">
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
                <p className="text-[18px] font-semibold leading-[1.3] tracking-tight text-[#333]">
                  {pickUp.title}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 記事一覧 + サイドバー */}
      <FocusArticleList heading={heading} q={q} tag={tag} />
    </div>
  );
}
