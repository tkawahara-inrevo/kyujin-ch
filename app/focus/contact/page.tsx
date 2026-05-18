import Link from "next/link";

export default function FocusContactPage() {
  return (
    <div className="mx-auto max-w-[600px] px-6 py-20 text-center">
      <h1 className="text-[32px] font-bold text-[#1f2775]">掲載希望の方はこちら</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[#555]">
        Focus への掲載をご希望の企業様は、下記よりお問い合わせください。
      </p>
      <p className="mt-2 text-[13px] text-[#888]">（掲載フォームは準備中です）</p>
      <Link
        href="/focus"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#1f2775] px-8 py-3 text-[15px] font-bold text-white transition hover:opacity-90"
      >
        記事一覧に戻る
      </Link>
    </div>
  );
}
