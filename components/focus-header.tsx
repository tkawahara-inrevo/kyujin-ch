import Image from "next/image";
import Link from "next/link";

export function FocusHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#eee]">
      <div className="mx-auto flex h-[75px] max-w-[1280px] items-center justify-between px-6 md:px-12">
        {/* ロゴ */}
        <Link href="/focus" className="flex items-center">
          <Image
            src="/assets/Focus_ロゴ@2x.png"
            alt="Focus"
            height={32}
            width={120}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* ナビ */}
        <div className="flex items-center gap-6 md:gap-[40px]">
          <nav className="hidden items-center gap-[30px] md:flex">
            <Link href="/focus/about" className="text-[15px] font-bold text-[#767676] transition hover:text-[#1f2775]">
              Focusとは
            </Link>
            <Link href="/focus/new" className="text-[15px] font-bold text-[#767676] transition hover:text-[#1f2775]">
              新着
            </Link>
            <Link href="/focus/hot" className="text-[15px] font-bold text-[#767676] transition hover:text-[#1f2775]">
              人気
            </Link>
            <Link href="/focus/search" className="text-[15px] font-bold text-[#767676] transition hover:text-[#1f2775]">
              カテゴリー
            </Link>
          </nav>
          <Link
            href="/focus/contact"
            className="rounded-full bg-[#1f2775] px-[20px] py-[10px] text-[14px] font-bold text-white transition hover:opacity-90 md:px-[30px] md:text-[16px]"
          >
            掲載希望はこちら
          </Link>
        </div>
      </div>
    </header>
  );
}
