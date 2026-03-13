"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthDialog } from "./auth-dialog";

type Props = {
  href: string;
  isLoggedIn: boolean;
  hasApplied?: boolean;
  label?: string;
  className?: string;
};

export function ApplyButton({
  href,
  isLoggedIn,
  hasApplied = false,
  label = "応募する",
  className = "block rounded-[10px] bg-[#2f6cff] px-6 py-4 text-center text-[15px] font-bold text-white transition hover:opacity-90",
}: Props) {
  const [showAuth, setShowAuth] = useState(false);

  // 応募済み
  if (hasApplied) {
    return (
      <span
        className={className
          .replace("bg-[#2f6cff]", "bg-[#ccc]")
          .replace("hover:opacity-90", "cursor-default")}
      >
        応募済み
      </span>
    );
  }

  // ログイン済み
  if (isLoggedIn) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  // 未ログイン
  return (
    <>
      <button onClick={() => setShowAuth(true)} className={className}>
        会員登録して応募
      </button>
      {showAuth && (
        <AuthDialog initialMode="register" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
