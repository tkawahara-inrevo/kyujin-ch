"use client";

import { useState } from "react";
import { AuthDialog } from "./auth-dialog";

type Mode = "register" | "login";

export function MobileAuthBar() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  function openDialog(m: Mode) {
    setMode(m);
    setOpen(true);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e0e0e0] bg-white md:hidden">
        <p className="bg-[#ff3158] px-4 py-1.5 text-center text-[11px] font-bold text-white">
          応募にはログインもしくは新規会員登録が必要です
        </p>
        <div className="grid grid-cols-2">
          <button
            onClick={() => openDialog("login")}
            className="py-3 text-center text-[14px] font-bold text-white bg-[#2f6cff]"
          >
            ログイン
          </button>
          <button
            onClick={() => openDialog("register")}
            className="py-3 text-center text-[14px] font-bold text-[#ff3158] bg-white"
          >
            新規会員登録
          </button>
        </div>
      </div>

      {open && (
        <AuthDialog initialMode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
