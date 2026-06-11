import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FocusSidebar } from "@/components/focus-sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Focusとは" };

const VALUES = [
  {
    title: "完全無料で自社をPR",
    img: "/assets/focus_about/value-01.png",
    body: "外部メディアであるFocusが、貴社の魅力を客観的なコンテンツとして無償で紹介・拡散します。",
  },
  {
    title: "SEO効果の期待",
    img: "/assets/focus_about/value-02.png",
    body: "良質な外部リンクが増加することで検索エンジンからの評価が高まり、Web上での露出機会が増加します。",
  },
  {
    title: "応募者の信頼度アップ",
    img: "/assets/focus_about/value-03.png",
    body: "検索時に、第三者による紹介記事が存在することで、企業の社会的信用や安心感が大きく高まります。",
  },
  {
    title: "広報ツールに",
    img: "/assets/focus_about/value-04.png",
    body: "企業としての想いや魅力を深掘りしたインタビュー内容になるため、求職者向けだけでなく、社内エンゲージメントを高める「社内報」としても二次利用が可能です。",
  },
];

export default async function FocusAboutPage() {
  // サイドバー用データ
  const [allArticles, ranking] = await Promise.all([
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
    prisma.focusArticle.findMany({
      where: { isPublished: true },
      orderBy: [{ isHot: "desc" }, { publishedAt: "desc" }],
      take: 5,
      select: { id: true, slug: true, title: true, thumbnailUrl: true },
    }),
  ]);
  const allTags = [...new Set(allArticles.flatMap((a) => a.tags))];

  return (
    <div>
      {/* ヒーロー: 400px・白背景・Focus大ロゴ＋テキスト */}
      <section className="bg-white">
        <div className="mx-auto flex h-[400px] max-w-[1440px] items-center px-6 md:px-[270px]">
          <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:gap-12">
            <Image
              src="/assets/Focus_ロゴ@2x.png"
              alt="Focus"
              height={143}
              width={400}
              className="h-[100px] w-auto md:h-[143px]"
              priority
            />
            <p className="text-center text-[14px] font-bold leading-[1.6] text-[#333] md:text-left md:text-[18px]">
              『Focus』は一社一社の魅力や<br />
              ストーリーにスポットライトを当て、<br />
              想いを紡ぐインタビューを通じてその価値を発信します。
            </p>
          </div>
        </div>
      </section>

      {/* メインコンテンツ + サイドバー */}
      <div className="mx-auto max-w-[1440px] px-6 pb-16 md:px-[270px]">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1 space-y-[100px]">

            {/* Section 1: 輝きに焦点を当て */}
            <section>
              <div className="mb-[10px] h-[5px] w-[50px] bg-[#1f2775]" />
              <div className="relative">
                {/* 背景イメージ (右上) */}
                <Image
                  src="/assets/focus_about/about-img01.png"
                  alt=""
                  width={583}
                  height={540}
                  className="pointer-events-none absolute right-0 top-0 h-auto w-[60%] max-w-[600px] opacity-30 md:w-[64%]"
                />

                {/* タイトル */}
                <div className="relative">
                  <h2 className="text-[24px] font-bold leading-[1.4] text-[#333] md:text-[36px]">
                    輝きに焦点を当て、<br />
                    採用の可能性を最大化する。
                  </h2>
                  <p className="mt-[10px] text-[16px] font-bold text-[#767676] md:text-[20px]">
                    Focusに込めた思い
                  </p>
                </div>

                {/* 本文 (左寄せ・w-400px) */}
                <div className="relative mt-8 max-w-[400px] space-y-[26.4px] text-[14px] font-bold leading-[1.65] text-[#333] md:mt-[60px] md:text-[16px]">
                  <p>「Focus」という名前には、2つの強い想いが込められています。</p>
                  <p>
                    1つは、INREVOが一社一社の企業様に深く焦点を当て、その魅力を世の中に発信していくという意味。そしてもう1つは、企業様の「採用支援」に徹底的にフォーカス（注力）するという意味です。
                  </p>
                  <p>
                    私たちは、ヒトトレ採用をハブとしながら、クライアント企業様と手を携えた広報活動を展開します。お互いの強みを掛け合わせることで、これまでにない情報の拡散力を生み出します。
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: 第三者視点 */}
            <section>
              <div className="mb-[10px] h-[5px] w-[50px] bg-[#1f2775]" />
              <div className="relative">
                {/* 背景イメージ (左上) */}
                <Image
                  src="/assets/focus_about/about-img02.png"
                  alt=""
                  width={695}
                  height={540}
                  className="pointer-events-none absolute left-0 top-0 h-auto w-[70%] max-w-[695px] opacity-30 md:w-[77%]"
                />

                {/* タイトル */}
                <div className="relative">
                  <h2 className="text-[24px] font-bold leading-[1.4] text-[#333] md:text-[36px]">
                    第三者視点の情報が、<br />
                    求職者の「信頼」と「応募」をつなぐ
                  </h2>
                  <p className="mt-[10px] text-[16px] font-bold text-[#767676] md:text-[20px]">
                    Focusが目指すもの
                  </p>
                </div>

                {/* 本文 (右寄せ・w-400px) */}
                <div className="relative mt-8 max-w-[400px] space-y-[26.4px] text-[14px] font-bold leading-[1.65] text-[#333] md:mt-[80px] md:ml-auto md:text-[16px]">
                  <p>
                    私たちが目指すのは、求職者が企業名を検索した際に、自社発信の情報だけでなく、第三者からの紹介情報やインタビューが自然と目に留まる仕組みです。
                  </p>
                  <p>
                    求職者にとって「他者からどう評価されているか」は、応募を決意する重要な安心材料になります。客観的な視点から企業様の魅力を届けることで、応募者の信頼度を飛躍的に向上させ、採用ブランディングの強化という相乗効果を創出します。
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: 4つの価値 */}
            <section>
              <div className="mb-[10px] h-[5px] w-[50px] bg-[#1f2775]" />
              <h2 className="text-[24px] font-bold leading-[1.4] text-[#333] md:text-[36px]">
                採用ブランディングを加速させる、<br />
                4つの価値
              </h2>
              <p className="mt-[10px] text-[16px] font-bold text-[#767676] md:text-[20px]">
                Focusが提供するもの
              </p>

              <div className="mt-[30px] grid grid-cols-1 gap-x-[10px] gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {VALUES.map((v) => (
                  <div key={v.title} className="flex flex-col items-center gap-[30px] text-center">
                    <p className="text-[18px] font-bold leading-[1.32] text-[#333] md:text-[20px]">
                      {v.title}
                    </p>
                    <div className="flex h-[100px] w-full items-center justify-center">
                      <Image
                        src={v.img}
                        alt=""
                        width={180}
                        height={100}
                        className="h-auto max-h-[100px] w-auto"
                      />
                    </div>
                    <p className="text-[14px] font-bold leading-[1.65] text-[#333] md:text-[16px]">
                      {v.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* バナー */}
            <Link
              href="/"
              className="block transition hover:opacity-90"
              aria-label="求人ちゃんねるトップへ"
            >
              <Image
                src="/assets/focus_about/banner.png"
                alt="変えるのは自分だ。求人ちゃんねる"
                width={1200}
                height={200}
                className="h-auto w-full"
              />
            </Link>

            {/* CTA */}
            <section className="flex flex-col items-center gap-5 rounded-2xl bg-[#1f2775] px-6 py-12 text-center">
              <p className="text-[22px] font-bold text-white md:text-[26px]">
                貴社の魅力を、Focusで発信しませんか？
              </p>
              <Link
                href="/focus/contact"
                className="rounded-full bg-white px-10 py-4 text-[16px] font-bold text-[#1f2775] transition hover:opacity-90"
              >
                掲載希望はこちら
              </Link>
            </section>
          </div>

          {/* 右サイドバー */}
          <div className="hidden lg:block">
            <Suspense>
              <FocusSidebar allTags={allTags} ranking={ranking} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
