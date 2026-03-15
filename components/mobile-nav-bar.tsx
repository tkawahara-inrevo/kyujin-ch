"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "ホーム",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2f6cff" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/applications",
    label: "応募済み",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2f6cff" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "気になる",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#2f6cff" : "none"} stroke={active ? "#2f6cff" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "メッセージ",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2f6cff" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: true,
  },
  {
    href: "/mypage",
    label: "マイページ",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2f6cff" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function MobileNavBar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/user/unread-count", { cache: "no-store" });
        const data = await response.json();
        setUnread(data.count || 0);
      } catch {
        // noop
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadUnreadCount();
      }
    }

    loadUnreadCount();
    const interval = setInterval(() => {
      fetch("/api/user/unread-count", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setUnread(d.count || 0))
        .catch(() => {});
    }, 30000);
    window.addEventListener("focus", loadUnreadCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadUnreadCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e8e8] bg-white lg:hidden">
      <div className="flex justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <span className="relative">
                {item.icon(isActive)}
                {item.badge && unread > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ff3158] px-1 text-[9px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </span>
              <span className={`text-[10px] ${isActive ? "font-bold text-[#2f6cff]" : "text-[#999]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
