"use client";

import { useState } from "react";
import { AuthDialog } from "./auth-dialog";

type Mode = "register" | "login";

export function SidebarAuthButtons() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("register");

  function openDialog(m: Mode) {
    setMode(m);
    setOpen(true);
  }

  return (
    <>
      <div className="space-y-1 border-t border-[#ececec] pt-4">
        <button
          onClick={() => openDialog("register")}
          className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-[#f7f7f7]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          登録する
        </button>
        <button
          onClick={() => openDialog("login")}
          className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-[#f7f7f7]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          ログイン
        </button>
      </div>

      {open && (
        <AuthDialog initialMode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
