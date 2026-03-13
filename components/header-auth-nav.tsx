"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function HeaderAuthNav() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center gap-4 md:flex">
        <Link
          href="/mypage"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#444] hover:text-[#2f6cff]"
        >
          <Image src="/assets/User_01_bl.png" alt="" width={17} height={17} className="object-contain" />
          <span>マイページ</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-[13px] font-semibold text-[#888] hover:text-[#ff3158]"
        >
          ログアウト
        </button>
      </div>

      {/* Mobile: アイコンのみ */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="p-1.5 text-[#888] md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </>
  );
}
