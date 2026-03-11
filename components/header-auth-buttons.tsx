"use client";

import { useState } from "react";
import Image from "next/image";
import { AuthDialog } from "./auth-dialog";

type Mode = "register" | "login";

export function HeaderAuthButtons() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("register");

  function openDialog(m: Mode) {
    setMode(m);
    setOpen(true);
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center gap-3 md:flex">
        <button
          onClick={() => openDialog("register")}
          className="flex items-center gap-1.5 rounded-[8px] border border-[#2f6cff] px-4 py-1.5 text-[13px] font-semibold text-[#2f6cff] hover:bg-[#f0f5ff]"
        >
          <Image src="/assets/Edit.png" alt="" width={14} height={14} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          登録する
        </button>
        <button
          onClick={() => openDialog("login")}
          className="flex items-center gap-1.5 rounded-[8px] bg-[#2f6cff] px-4 py-1.5 text-[13px] font-bold text-white hover:opacity-90"
        >
          <Image src="/assets/User_01.png" alt="" width={14} height={14} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ログイン
        </button>
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={() => openDialog("register")}
          className="flex flex-col items-center gap-0.5 px-1"
        >
          <Image src="/assets/Edit.png" alt="" width={20} height={20} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="text-[10px] font-semibold text-[#2f6cff]">登録する</span>
        </button>
        <button
          onClick={() => openDialog("login")}
          className="flex flex-col items-center gap-0.5 px-1"
        >
          <Image src="/assets/User_01.png" alt="" width={20} height={20} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="text-[10px] font-bold text-[#2f6cff]">ログイン</span>
        </button>
      </div>

      {open && (
        <AuthDialog initialMode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
