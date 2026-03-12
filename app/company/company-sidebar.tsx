"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/company/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/company/jobs", label: "求人管理", icon: "📋" },
  { href: "/company/applicants", label: "応募者管理", icon: "👤" },
  { href: "/company/messages", label: "メッセージ", icon: "💬", badge: true },
  { href: "/company/billing", label: "請求管理", icon: "💰" },
  { href: "/company/analytics", label: "分析", icon: "📈" },
  { href: "/company/settings", label: "設定", icon: "⚙️" },
];

export function CompanySidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/company/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count))
      .catch(() => {});

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetch("/api/company/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
      <div className="flex h-[64px] items-center border-b border-[#e5e7eb] px-5">
        <Link href="/company/dashboard" className="text-[18px] font-bold text-[#1e3a5f]">
          求人ちゃんねる
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition ${
                    isActive
                      ? "bg-[#2f6cff]/10 text-[#2f6cff] font-semibold"
                      : "text-[#555] hover:bg-[#f7f7f7]"
                  }`}
                >
                  <span className="text-[16px]">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && unreadCount > 0 && (
                    <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[11px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
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
          <span className="text-[16px]">🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
