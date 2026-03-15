"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/company/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/company/jobs", label: "求人管理", icon: "🧾" },
  {
    href: "/company/applicants",
    label: "応募者管理",
    icon: "👤",
    badgeType: "applications" as const,
  },
  {
    href: "/company/messages",
    label: "メッセージ",
    icon: "✉️",
    badgeType: "messages" as const,
  },
  { href: "/company/billing", label: "請求管理", icon: "💳" },
  { href: "/company/analytics", label: "分析", icon: "📈" },
  { href: "/company/settings", label: "設定", icon: "⚙️" },
];

export function CompanySidebar() {
  const pathname = usePathname();
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [newApplicationCount, setNewApplicationCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadBadges() {
      try {
        const [messageResponse, applicationResponse] = await Promise.all([
          fetch("/api/company/unread-count", { cache: "no-store" }),
          fetch("/api/company/new-applications-count", { cache: "no-store" }),
        ]);
        const [messageData, applicationData] = await Promise.all([
          messageResponse.json(),
          applicationResponse.json(),
        ]);

        setMessageUnreadCount(messageData.count || 0);
        setNewApplicationCount(applicationData.count || 0);
      } catch {
        // noop
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadBadges();
      }
    }

    loadBadges();
    const interval = setInterval(loadBadges, 30000);

    window.addEventListener("focus", loadBadges);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadBadges);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const badgeCount =
              item.badgeType === "messages"
                ? messageUnreadCount
                : item.badgeType === "applications"
                  ? newApplicationCount
                  : 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition ${
                    isActive
                      ? "bg-[#2f6cff]/10 font-semibold text-[#2f6cff]"
                      : "text-[#555] hover:bg-[#f7f7f7]"
                  }`}
                >
                  <span className="text-[16px]">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[11px] font-bold text-white">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#e5e7eb] px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: "/company/login" })}
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#888] hover:bg-[#f7f7f7]"
        >
          <span className="text-[16px]">↩</span>
          <span>ログアウト</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-[64px] items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e5e7eb] text-[#1e3a5f]"
          aria-label="メニューを開く"
        >
          <span className="text-[18px]">☰</span>
        </button>
        <Link href="/company/dashboard" className="text-[16px] font-bold text-[#1e3a5f]">
          企業ちゃんねる
        </Link>
        <div className="w-10" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="メニューを閉じる"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
            <div className="flex h-[64px] items-center justify-between border-b border-[#e5e7eb] px-5">
              <Link
                href="/company/dashboard"
                className="truncate text-[18px] font-bold text-[#1e3a5f]"
              >
                企業ちゃんねる
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e5e7eb] text-[#666]"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white md:flex">
        <div className="flex h-[64px] items-center border-b border-[#e5e7eb] px-5">
          <Link href="/company/dashboard" className="text-[18px] font-bold text-[#1e3a5f]">
            企業ちゃんねる
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  );
}
