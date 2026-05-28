import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Focusとは" };

const VALUES = [
  {
    title: "完全無料で自社をPR",
    body: "外部メディアであるFocusが、貴社の魅力を客観的なコンテンツとして無償で紹介・拡散します。",
    icon: "📣",
  },
  {
    title: "SEO効果の期待",
    body: "良質な外部リンクが増加することで検索エンジンからの評価が高まり、Web上での露出機会が増加します。",
    icon: "🔍",
  },
  {
    title: "応募者の信頼度アップ",
    body: "検索時に、第三者による紹介記事が存在することで、企業の社会的信用や安心感が大きく高まります。",
    icon: "🤝",
  },
  {
    title: "広報ツールに",
    body: "企業としての想いや魅力を深掘りしたインタビュー内容になるため、求職者向けだけでなく、社内エンゲージメントを高める「社内報」としても二次利用が可能です。",
    icon: "📰",
  },
];

function SectionHeading({ title, sub }: { title: React.ReactNode; sub: string }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="h-[5px] w-[50px] bg-[#1f2775]" />
      <h2 className="text-[28px] font-bold leading-[1.4] text-[#333] md:text-[36px]">{title}</h2>
      <p className="text-[18px] font-bold text-[#767676] md:text-[20px]">{sub}</p>
    </div>
  );
}

export default function FocusAboutPage() {
  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-white px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 md:flex-row md:justify-between">
          <Image
            src="/assets/Focus-fv.png"
            alt="Focus"
            height={120}
            width={337}
            className="h-[90px] w-auto md:h-[120px]"
            priority
          />
          <p className="text-center text-[16px] font-bold leading-relaxed text-[#333] md:text-left md:text-[18px]">
            『Focus』は一社一社の魅力や<br />
            ストーリーにスポットライトを当て、<br />
            想いを紡ぐインタビューを通じてその価値を発信します。
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-[80px] px-6 py-12 md:px-12">
        {/* Focusに込めた思い */}
        <section>
          <SectionHeading
            title={<>輝きに焦点を当て、<br />採用の可能性を最大化する。</>}
            sub="Focusに込めた思い"
          />
          <div className="mt-6 space-y-4 text-[15px] font-bold leading-[1.9] text-[#333] md:text-[16px]">
            <p>「Focus」という名前には、2つの強い想いが込められています。</p>
            <p>
              1つは、INREVOが一社一社の企業様に深く焦点を当て、その魅力を世の中に発信していくという意味。
              そしてもう1つは、企業様の「採用支援」に徹底的にフォーカス（注力）するという意味です。
            </p>
            <p>
              私たちは、ヒトトレ採用をハブとしながら、クライアント企業様と手を携えた広報活動を展開します。
              お互いの強みを掛け合わせることで、これまでにない情報の拡散力を生み出します。
            </p>
          </div>
        </section>

        {/* Focusが目指すもの */}
        <section>
          <SectionHeading
            title={<>第三者視点の情報が、<br />求職者の「信頼」と「応募」をつなぐ</>}
            sub="Focusが目指すもの"
          />
          <div className="mt-6 space-y-4 text-[15px] font-bold leading-[1.9] text-[#333] md:text-[16px]">
            <p>
              私たちが目指すのは、求職者が企業名を検索した際に、自社発信の情報だけでなく、
              第三者からの紹介情報やインタビューが自然と目に留まる仕組みです。
            </p>
            <p>
              求職者にとって「他者からどう評価されているか」は、応募を決意する重要な安心材料になります。
              客観的な視点から企業様の魅力を届けることで、応募者の信頼度を飛躍的に向上させ、
              採用ブランディングの強化という相乗効果を創出します。
            </p>
          </div>
        </section>

        {/* Focusが提供するもの（4つの価値） */}
        <section>
          <SectionHeading
            title={<>採用ブランディングを加速させる、<br />4つの価値</>}
            sub="Focusが提供するもの"
          />
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-4 text-center">
                <p className="text-[20px] font-bold text-[#333]">{v.title}</p>
                <div className="flex h-[100px] w-full items-center justify-center text-[48px]">{v.icon}</div>
                <p className="text-[15px] font-bold leading-[1.65] text-[#333]">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-5 rounded-2xl bg-[#1f2775] px-6 py-12 text-center">
          <p className="text-[22px] font-bold text-white md:text-[26px]">貴社の魅力を、Focusで発信しませんか？</p>
          <Link
            href="/focus/contact"
            className="rounded-full bg-white px-10 py-4 text-[16px] font-bold text-[#1f2775] transition hover:opacity-90"
          >
            掲載希望はこちら
          </Link>
        </section>
      </div>
    </div>
  );
}
