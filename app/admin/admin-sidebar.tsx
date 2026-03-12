"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/companies", label: "企業一覧", icon: "🏢" },
  { href: "/admin/jobseekers", label: "求職者一覧", icon: "👤" },
  { href: "/admin/jobs", label: "求人一覧", icon: "📋" },
  { href: "/admin/billing", label: "料金表管理", icon: "💰" },
  { href: "/admin/invalid-requests", label: "無効申請管理", icon: "🔍" },
  { href: "/admin/analytics", label: "分析", icon: "📈" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#e5e7eb] bg-[#1e293b]">
      <div className="flex h-[64px] items-center border-b border-[#334155] px-5">
        <Link href="/admin/dashboard" className="text-[18px] font-bold text-white">
          管理画面
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#334155] px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#94a3b8] hover:bg-white/5 hover:text-white"
        >
          <span className="text-[16px]">🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
