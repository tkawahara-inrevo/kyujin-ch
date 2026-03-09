import Image from "next/image";
import Link from "next/link";

const navItems = [
  {
    href: "/applications",
    label: "応募済み",
    icon: "/assets/Checkbox_Check.png",
  },
  {
    href: "/favorites",
    label: "気になる",
    icon: "/assets/Bookmark.png",
  },
  {
    href: "/messages",
    label: "メッセージ",
    icon: "/assets/Chat_Circle.png",
  },
];

export function Header() {
  return (
    <header className="border-b border-[#e9e9e9] bg-white">
      <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-[34px] w-[150px]">
              <Image
                src="/assets/Person.png"
                alt="求人ちゃんねる"
                fill
                className="object-contain object-left"
                sizes="150px"
              />
            </div>
            <span className="sr-only">求人ちゃんねる</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-md bg-[#ff3158] px-5 py-[6px] text-[13px] font-bold text-white">
              27卒
            </div>
            <span className="text-[11px] font-medium text-[#ff3158]">
              28卒予定の方はこちら
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#444]"
            >
              <Image
                src={item.icon}
                alt=""
                width={18}
                height={18}
                className="object-contain"
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}