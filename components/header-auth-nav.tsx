"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function HeaderAuthNav() {
  return (
    <div className="flex items-center gap-4">
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
  );
}
