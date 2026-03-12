import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { HeaderAuthNav } from "./header-auth-nav";
import { HeaderAuthButtons } from "./header-auth-buttons";

const navItems = [
  { href: "/applications", label: "応募済み", icon: "/assets/Checkbox_Check.png" },
  { href: "/favorites",    label: "気になる",   icon: "/assets/Bookmark.png" },
  { href: "/messages",     label: "メッセージ", icon: "/assets/Chat_Circle.png" },
];

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="border-b border-[#e9e9e9] bg-white">
      <div className="mx-auto grid h-[74px] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6">

        {/* 左：ロゴ + バッジ */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-[30px] w-[30px] shrink-0">
              <Image
                src="/assets/Person.png"
                alt=""
                fill
                className="object-contain"
                sizes="30px"
              />
            </div>
            <span className="text-[18px] font-bold text-[#1a1a1a]">求人ちゃんねる</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-[6px] bg-[#ff3158] px-3 py-[5px] text-[12px] font-bold text-white">
              27卒
            </span>
            <span className="text-[11px] font-medium text-[#ff3158]">
              28卒予定の方はこちら
            </span>
          </div>
        </div>

        {/* 中央：リンク */}
        <div className="hidden items-center justify-center gap-6 md:flex">
          <Link
            href="/prices"
            className="text-[13px] font-semibold text-[#444] hover:underline"
          >
            料金表
          </Link>
          <Link
            href="/company/login"
            className="text-[13px] font-semibold text-[#444] hover:underline"
          >
            求人掲載を検討中の企業様へ
          </Link>
        </div>

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
    </header>
  );
}
