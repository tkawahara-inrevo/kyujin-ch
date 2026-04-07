"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function SeoEditorSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = pathname === "/admin/columns" || pathname.startsWith("/admin/columns/");

  const navContent = (
    <>
      <div className="flex h-[64px] items-center gap-2 px-5 font-bold text-[#1e293b]">
        <span className="text-[18px]">📝</span>
        <span className="text-[15px]">コラム管理</span>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/columns"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition ${
                isActive ? "bg-[#2f6cff]/10 font-semibold text-[#2f6cff]" : "text-[#555] hover:bg-[#f7f7f7]"
              }`}
            >
              <span className="text-[16px]">📝</span>
              <span>コラム一覧</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/columns/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#555] transition hover:bg-[#f7f7f7]"
            >
              <span className="text-[16px]">✏️</span>
              <span>新規作成</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="border-t border-[#e5e7eb] px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#ef4444] transition hover:bg-[#fff1f2]"
        >
          <span className="text-[16px]">🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white xl:flex">
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-[64px] items-center justify-between border-b border-[#e5e7eb] bg-white px-4 xl:hidden">
        <span className="text-[15px] font-bold text-[#1e293b]">コラム管理</span>
        <button onClick={() => setIsOpen(true)} className="text-[22px]">☰</button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[220px] flex-col bg-white">
            <button onClick={() => setIsOpen(false)} className="absolute right-3 top-3 text-[20px] text-[#888]">✕</button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
