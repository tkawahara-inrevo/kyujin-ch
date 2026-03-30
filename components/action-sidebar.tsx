import Image from "next/image";
import Link from "next/link";
import { ApplyButton } from "./apply-button";
import { SidebarAuthButtons } from "./sidebar-auth-buttons";

type ActionSidebarProps = {
  applyHref?: string;
  primaryLabel?: string;
  isLoggedIn?: boolean;
  hasApplied?: boolean;
  unreadCount?: number;
};

const menuItems = [
  { href: "/mypage", label: "マイページ", icon: "/assets/User_01_bl.png" },
  { href: "/applications", label: "応募済み", icon: "/assets/Checkbox_Check.png" },
  { href: "/favorites", label: "気になる", icon: "/assets/Bookmark_bl.png" },
  { href: "/messages", label: "メッセージ", icon: "/assets/Chat_Circle_bl.png" },
];

export function ActionSidebar({
  applyHref = "/jobs",
  primaryLabel = "求人一覧を見る",
  isLoggedIn = false,
  hasApplied = false,
  unreadCount = 0,
}: ActionSidebarProps) {
  const showApplyButton = primaryLabel.includes("応募");

  return (
    <aside className="sticky top-6 self-start hidden lg:block">
      <div className="rounded-[20px] border border-[#e6e6e6] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
        {showApplyButton ? (
          <ApplyButton
            href={applyHref}
            isLoggedIn={isLoggedIn}
            hasApplied={hasApplied}
            label={primaryLabel}
            className="block w-full rounded-[12px] bg-[#2f6cff] px-4 py-4 text-center text-[14px] font-bold !text-white transition hover:opacity-90"
          />
        ) : (
          <Link
            href={applyHref}
            className="block w-full rounded-[12px] bg-[#2f6cff] px-4 py-4 text-center text-[14px] font-bold !text-white transition hover:opacity-90"
          >
            {primaryLabel}
          </Link>
        )}

        {!isLoggedIn && (
          <p className="mt-3 text-center text-[11px] leading-[1.7] text-[#8a8a8a]">
            応募にはログインもしくは
            <br />
            新規会員登録が必要です
          </p>
        )}

        <div className="mt-4">
          {isLoggedIn ? (
            <div className="border-t border-[#ececec] pt-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-[10px] px-2 py-3 text-[14px] font-semibold text-[#333] transition hover:bg-[#fafafa]"
                  >
                    <Image src={item.icon} alt="" width={20} height={20} />
                    <span>{item.label}</span>
                    {item.label === "メッセージ" && unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <SidebarAuthButtons />
          )}
        </div>
      </div>
    </aside>
  );
}
