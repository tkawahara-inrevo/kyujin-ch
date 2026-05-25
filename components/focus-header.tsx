import Image from "next/image";
import Link from "next/link";

export function FocusHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#eee]">
      <div className="mx-auto flex h-[75px] max-w-[1400px] items-center justify-between px-6 md:px-[270px]">
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
        <div className="flex items-center gap-[60px]">
          {/* 記事数が増えるまで一時的に非表示
          <nav className="hidden items-center gap-[60px] md:flex">
            <Link
              href="/focus?sort=new"
              className="text-[16px] font-bold text-[#767676] hover:text-[#1f2775] transition"
            >
              新着
            </Link>
            <Link
              href="/focus?sort=hot"
              className="text-[16px] font-bold text-[#767676] hover:text-[#1f2775] transition"
            >
              人気の企業
            </Link>
          </nav>
          */}
          <Link
            href="/focus/contact"
            className="rounded-full bg-[#1f2775] px-[30px] py-[10px] text-[16px] font-bold text-white transition hover:opacity-90"
          >
            掲載希望はこちら
          </Link>
        </div>
      </div>
    </header>
  );
}
