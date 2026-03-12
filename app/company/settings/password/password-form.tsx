"use client";

import { useState, useTransition } from "react";
import { changeCompanyPassword } from "@/app/actions/company/password";

export default function PasswordChangeForm() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPw.length < 6) {
      setError("新しいパスワードは6文字以上にしてください");
      return;
    }
    if (newPw !== confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }

    startTransition(async () => {
      try {
        await changeCompanyPassword(current, newPw);
      } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {error && (
        <div className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#555]">現在のパスワード</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#555]">新しいパスワード</label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-semibold text-[#555]">新しいパスワード（確認）</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2.5 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[8px] bg-[#2f6cff] py-3 text-[14px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
      >
        {isPending ? "変更中..." : "パスワードを変更"}
      </button>
    </form>
  );
}
