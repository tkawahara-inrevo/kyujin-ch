import Image from "next/image";
import Link from "next/link";

export function BizColumnHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#22307e] bg-[#1f2775]">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-3 px-4 md:h-[72px] md:px-6">
        {/* 左：ロゴ */}
        <Link href="/biz-column" className="flex items-center gap-2">
          <div className="relative h-[24px] w-[24px] shrink-0">
            <Image src="/favicon-32.png" alt="" fill className="object-contain" sizes="24px" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-bold text-white md:text-[16px]">求人ちゃんねる</span>
            <span className="text-[10px] text-white/70">採用お役立ち情報</span>
          </div>
        </Link>

        {/* 右：CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/service"
            className="hidden rounded-full border border-white px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-white/10 md:inline-flex"
          >
            サービス詳細
          </Link>
          <Link
            href="/shiryouseikyuu/"
            className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1f2775] shadow-sm transition hover:opacity-90"
          >
            資料ダウンロード
          </Link>
        </div>
      </div>
    </header>
  );
}
