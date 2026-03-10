import Image from "next/image";
import Link from "next/link";

type ActionSidebarProps = {
  applyHref?: string;
  primaryLabel?: string;
};

const menuItems = [
  { href: "/mypage", label: "マイページ", icon: "/assets/User_01_bl.png" },
  { href: "/applications", label: "応募済み", icon: "/assets/Checkbox_Check.png" },
  { href: "/favorites", label: "気になる", icon: "/assets/Bookmark_bl.png" },
  { href: "/messages", label: "メッセージ", icon: "/assets/Chat_Circle_bl.png" },
];

export function ActionSidebar({
  applyHref = "#",
  primaryLabel = "今すぐ応募する",
}: ActionSidebarProps) {
  return (
    <aside className="self-start lg:sticky lg:top-6">
      <div className="rounded-[20px] border border-[#e6e6e6] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
        <Link
          href={applyHref}
          className="block rounded-[12px] bg-[#2f6cff] px-4 py-4 text-center text-[14px] font-bold text-white transition hover:opacity-90"
        >
          {primaryLabel}
        </Link>

        <p className="mt-4 text-[11px] leading-[1.6] text-[#8a8a8a]">
          会員登録で応募やお気に入り、メッセージ
          <br />
          機能などが無料で使い放題！
        </p>

        <div className="mt-5 border-t border-[#ececec] pt-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-[10px] px-2 py-3 text-[14px] font-semibold text-[#333] transition hover:bg-[#fafafa]"
              >
                <Image src={item.icon} alt="" width={20} height={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-[#ececec] pt-5">
          <div className="rounded-[10px] border border-[#ff4167] px-3 py-3 text-center text-[12px] font-bold leading-[1.5] text-[#ff4167]">
            2027年卒業
            <br />
            新卒採用専用サイト
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[10px] bg-[#ff3158] px-3 py-3 text-center text-[11px] font-bold leading-[1.5] text-white">
              2028年
              <br />
              卒業予定の方は
              <br />
              こちら
            </div>
            <div className="rounded-[10px] bg-[#2f6cff] px-3 py-3 text-center text-[11px] font-bold leading-[1.5] text-white">
              転職活動中の方は
              <br />
              こちら
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}