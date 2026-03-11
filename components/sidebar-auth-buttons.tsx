"use client";

import { useState } from "react";
import Image from "next/image";
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
      <div className="space-y-2 border-t border-[#ececec] pt-4">
        <button
          onClick={() => openDialog("register")}
          className="flex w-full items-center gap-2 rounded-[8px] border border-[#2f6cff] px-3 py-2.5 text-[13px] font-semibold text-[#2f6cff] hover:bg-[#f0f5ff]"
        >
          <Image src="/assets/Edit.png" alt="" width={15} height={15} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          登録する
        </button>
        <button
          onClick={() => openDialog("login")}
          className="flex w-full items-center gap-2 rounded-[8px] bg-[#2f6cff] px-3 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
        >
          <Image src="/assets/User_01.png" alt="" width={15} height={15} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ログイン
        </button>
      </div>

      {open && (
        <AuthDialog initialMode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
