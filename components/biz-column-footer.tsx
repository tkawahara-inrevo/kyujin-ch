import Image from "next/image";
import Link from "next/link";

export function BizColumnFooter() {
  return (
    <footer className="mt-20 bg-[#1f2775]">
      {/* CTA帯 */}
      <div className="border-b border-white/15 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[1280px] text-center">
          <p className="text-[20px] font-bold text-white md:text-[24px]">応募0なのに、掲載費を払い続けていませんか？</p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/80">
            掲載費はかからず、応募が来た分だけ課金。<br className="hidden md:inline" />
            エージェントを介さない自主応募型だから、志望度の高い応募が集まります。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/shiryouseikyuu/"
              className="rounded-full bg-white px-7 py-3 text-[14px] font-bold text-[#1f2775] hover:opacity-90 transition"
            >
              資料ダウンロード
            </Link>
            <Link
              href="/service"
              className="rounded-full border border-white px-7 py-3 text-[14px] font-bold text-white hover:bg-white/10 transition"
            >
              サービス詳細
            </Link>
          </div>
        </div>
      </div>

      {/* リンク帯 */}
      <div className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-[1280px] flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/biz-column" className="flex items-center gap-2">
            <div className="relative h-[20px] w-[20px] shrink-0">
              <Image src="/favicon-32.png" alt="" fill className="object-contain" sizes="20px" />
            </div>
            <span className="text-[13px] font-bold text-white">求人ちゃんねる｜採用お役立ち情報</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/70">
            <Link href="/service" className="hover:underline">サービスサイト</Link>
            <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            <Link href="/" className="hover:underline">求職者向けトップ</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-white/50">© 求人ちゃんねる. all rights reserved.</p>
      </div>
    </footer>
  );
}
