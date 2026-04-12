"use client";

import { useState } from "react";
import { AuthDialog } from "./auth-dialog";

type Mode = "register" | "login";

export function HeaderAuthButtons({ hideMobile }: { hideMobile?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("register");

  function openDialog(m: Mode) {
    setMode(m);
    setOpen(true);
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center gap-6 md:flex">
        <button
          onClick={() => openDialog("register")}
          className="flex flex-col items-center gap-0.5 text-[#333] transition hover:text-[#2f6cff]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-[11px] font-semibold">登録する</span>
        </button>
        <button
          onClick={() => openDialog("login")}
          className="flex flex-col items-center gap-0.5 text-[#333] transition hover:text-[#2f6cff]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[11px] font-semibold">ログイン</span>
        </button>
      </div>

      {/* Mobile: アイコンのみ */}
      <div className={`flex items-center gap-2 md:hidden ${hideMobile ? "hidden" : ""}`}>
        <button
          onClick={() => openDialog("register")}
          className="p-1.5 text-[#333]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => openDialog("login")}
          className="p-1.5 text-[#333]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {open && (
        <AuthDialog initialMode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
