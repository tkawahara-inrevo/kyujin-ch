import Link from "next/link";

type Props = {
  variant: "header" | "footer" | "sidebar" | "article";
  className?: string;
};

export function BizColumnCTA({ variant, className = "" }: Props) {
  if (variant === "header") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Link
          href="/contact"
          className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1f2775] shadow-sm hover:opacity-90 transition"
        >
          お問い合わせ
        </Link>
        <Link
          href="/service"
          className="rounded-full border border-white px-4 py-1.5 text-[12px] font-bold text-white hover:bg-white/10 transition"
        >
          サービスサイト
        </Link>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`rounded-xl bg-[#1f2775] p-5 text-white shadow-sm ${className}`}>
        <p className="text-[14px] font-bold leading-relaxed">
          採用にお悩みなら
          <br />
          求人ちゃんねるへ
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/80">
          スカウト運用・求人作成・採用戦略まで一括サポート。まずはお気軽にご相談ください。
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/contact"
            className="rounded-full bg-white px-4 py-2 text-center text-[12px] font-bold text-[#1f2775] hover:opacity-90 transition"
          >
            お問い合わせ
          </Link>
          <Link
            href="/service"
            className="rounded-full border border-white px-4 py-2 text-center text-[12px] font-bold text-white hover:bg-white/10 transition"
          >
            サービス詳細を見る
          </Link>
        </div>
      </div>
    );
  }

  // footer
  return (
    <div className={`rounded-xl bg-gradient-to-r from-[#1a3a8f] to-[#2f6cff] p-6 text-white shadow-sm ${className}`}>
      <p className="text-[18px] font-bold">採用でお困りではないですか？</p>
      <p className="mt-2 text-[13px] leading-relaxed text-white/90">
        求人ちゃんねるは、母集団形成からスカウト運用までを伴走支援。中小企業の採用責任者から多くの相談をいただいています。
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-[#1f2775] hover:opacity-90 transition"
        >
          無料で相談する
        </Link>
        <Link
          href="/service"
          className="rounded-full border border-white px-6 py-2.5 text-[13px] font-bold text-white hover:bg-white/10 transition"
        >
          サービス詳細
        </Link>
      </div>
    </div>
  );
}
