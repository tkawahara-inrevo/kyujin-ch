import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { HeaderAuthNav } from "./header-auth-nav";
import { HeaderAuthButtons } from "./header-auth-buttons";
import { HeaderTargetBadge } from "./header-target-badge";
import { getActiveGraduationYears } from "@/lib/graduation-years";

const navItems = [
  { href: "/applications", label: "応募済み", icon: "/assets/Checkbox_Check.png" },
  { href: "/favorites",    label: "気になる",   icon: "/assets/Bookmark.png" },
  { href: "/messages",     label: "メッセージ", icon: "/assets/Chat_Circle.png" },
];

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const [currentYear, nextYear] = getActiveGraduationYears();

  return (
    <header className="border-b border-[#e9e9e9] bg-white">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-3 px-4 md:h-[74px] md:px-6">

        {/* 左：ロゴ + バッジ */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2">
            <div className="relative h-[24px] w-[24px] shrink-0 md:h-[30px] md:w-[30px]">
              <Image
                src="/assets/Person.png"
                alt=""
                fill
                className="object-contain"
                sizes="30px"
              />
            </div>
            <span className="text-[15px] font-bold text-[#1a1a1a] md:text-[18px]">求人ちゃんねる</span>
          </Link>

          <HeaderTargetBadge currentYear={currentYear} nextYear={nextYear} />
        </div>

        {/* 中央：企業向けリンク */}
        <Link
          href="/company/login"
          className="hidden text-[12px] font-semibold text-[#2f6cff] hover:underline md:block"
        >
          求人掲載を検討中の企業様へ
        </Link>

        {/* 右：ナビ or 認証ボタン */}
        {isLoggedIn ? (
          <>
            {/* Desktop */}
            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#444] hover:text-[#2f6cff]"
                >
                  <Image src={item.icon} alt="" width={17} height={17} className="object-contain" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <HeaderAuthNav />
            </nav>
            {/* Mobile */}
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/mypage" className="flex flex-col items-center gap-0.5 px-1">
                <Image src="/assets/User_01_bl.png" alt="" width={20} height={20} className="object-contain" />
                <span className="text-[10px] font-semibold text-[#444]">マイページ</span>
              </Link>
              <Link href="/messages" className="flex flex-col items-center gap-0.5 px-1">
                <Image src="/assets/Chat_Circle.png" alt="" width={20} height={20} className="object-contain" />
                <span className="text-[10px] font-semibold text-[#444]">メッセージ</span>
              </Link>
            </div>
          </>
        ) : (
          <HeaderAuthButtons />
        )}
      </div>

      {/* モバイル：企業向けリンク */}
      <div className="border-t border-[#f0f0f0] px-4 py-1.5 text-center md:hidden">
        <Link href="/company/login" className="text-[11px] font-semibold text-[#2f6cff] hover:underline">
          求人掲載を検討中の企業様へ
        </Link>
      </div>
    </header>
  );
}
