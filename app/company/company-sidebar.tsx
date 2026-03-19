"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/company/dashboard", label: "ダッシュボード", icon: "/assets/Graph.png" },
  { href: "/company/jobs", label: "求人管理", icon: "/assets/Paper.png" },
  {
    href: "/company/applicants",
    label: "応募者管理",
    icon: "/assets/Person.png",
    badgeType: "applications" as const,
  },
  {
    href: "/company/messages",
    label: "メッセージ",
    icon: "/assets/Chat_Circle.png",
    badgeType: "messages" as const,
  },
  { href: "/company/billing", label: "請求管理", icon: "/assets/List.png" },
  { href: "/company/analytics", label: "分析", icon: "/assets/Graph.png" },
  { href: "/company/settings", label: "設定", icon: "/assets/Edit_Pencil_Line_02.png" },
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
      <nav className="flex-1 px-7 py-8">
        <ul className="space-y-4">
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
                  className={`flex items-center gap-4 rounded-[12px] px-4 py-3 text-[15px] font-bold transition ${
                    isActive
                      ? "bg-[#eef4ff] text-[#222]"
                      : "text-[#222] hover:bg-[#f5f7fb]"
                  }`}
                >
                  <Image src={item.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 ? (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[11px] font-bold text-white">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#edf0f5] px-7 py-6">
        <button
          onClick={() => signOut({ callbackUrl: "/company/login" })}
          className="flex w-full items-center gap-4 rounded-[12px] px-4 py-3 text-[15px] font-bold text-[#7a7f87] transition hover:bg-[#f5f7fb]"
        >
          <span className="text-[22px]">⇦</span>
          <span>ログアウト</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#edf0f5] bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e7ebf3] text-[#20242d]"
          aria-label="メニューを開く"
        >
          <span className="text-[18px]">☰</span>
        </button>
        <Link href="/company/dashboard" className="flex items-center gap-2 text-[18px] font-bold text-[#20242d]">
          <Image src="/assets/Person.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span>求人ちゃんねる</span>
        </Link>
        <div className="w-10" />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="メニューを閉じる"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-[272px] max-w-[86vw] flex-col border-r border-[#edf0f5] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
            <div className="flex h-[120px] items-center justify-between border-b border-[#edf0f5] px-6">
              <Link href="/company/dashboard" className="flex items-center gap-3 text-[18px] font-bold text-[#20242d]">
                <Image src="/assets/Person.png" alt="" width={34} height={34} className="h-8 w-8 object-contain" />
                <span>求人ちゃんねる</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#e7ebf3] text-[#666]"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-[272px] shrink-0 flex-col border-r border-[#edf0f5] bg-white md:flex">
        <div className="flex h-[120px] items-center border-b border-[#edf0f5] px-8">
          <Link href="/company/dashboard" className="flex items-center gap-3 text-[20px] font-bold text-[#20242d]">
            <Image src="/assets/Person.png" alt="" width={38} height={38} className="h-9 w-9 object-contain" />
            <span>求人ちゃんねる</span>
          </Link>
        </div>
        {navContent}
      </aside>
    </>
  );
}
