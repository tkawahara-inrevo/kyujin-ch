"use client";

import { useState, useTransition } from "react";
import { changeUserPassword } from "@/app/actions/password";

export function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setSuccess(false); }}
        className="text-[14px] font-semibold text-[#2f6cff] hover:underline"
      >
        パスワードを変更する →
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPw.length < 8) { setError("新しいパスワードは8文字以上にしてください"); return; }
    if (newPw !== confirm) { setError("新しいパスワードが一致しません"); return; }

    startTransition(async () => {
      try {
        await changeUserPassword(current, newPw);
        setSuccess(true);
        setOpen(false);
        setCurrent(""); setNewPw(""); setConfirm("");
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-[12px] border border-[#e5e7eb] p-5">
      <h3 className="text-[15px] font-bold text-[#333]">パスワード変更</h3>
      {error && <p className="rounded bg-[#fff0f3] px-3 py-2 text-[13px] text-[#ff3158]">{error}</p>}
      {success && <p className="rounded bg-[#d1fae5] px-3 py-2 text-[13px] text-[#059669]">変更しました</p>}

      <input
        type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required
        placeholder="現在のパスワード"
        className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
      />
      <input
        type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8}
        placeholder="新しいパスワード（8文字以上）"
        className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
      />
      <input
        type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
        placeholder="新しいパスワード（確認）"
        className="w-full rounded-[8px] border border-[#d8d8d8] px-4 py-2.5 text-[14px] outline-none focus:border-[#2f6cff]"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50">
          {isPending ? "変更中..." : "変更する"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }}
          className="rounded-[8px] border border-[#d8d8d8] px-5 py-2.5 text-[14px] font-semibold text-[#666] hover:bg-[#f5f5f5]">
          キャンセル
        </button>
      </div>
    </form>
  );
}
