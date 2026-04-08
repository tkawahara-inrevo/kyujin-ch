"use client";

import { useState, useTransition } from "react";
import { resetCompanyPasswordByAdmin } from "@/app/actions/admin/company-edit";

export default function PasswordResetForm({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    setError("");
    setSuccess(false);
    startTransition(async () => {
      try {
        await resetCompanyPasswordByAdmin(companyId, password);
        setSuccess(true);
        setOpen(false);
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "失敗しました");
      }
    });
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setOpen(true); setSuccess(false); }}
          className="rounded-[8px] border border-[#d1d5db] px-4 py-1.5 text-[13px] font-semibold text-[#555] hover:bg-[#f7f7f7]"
        >
          パスワードを変更
        </button>
        {success && <span className="text-[13px] font-medium text-[#059669]">変更しました</span>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-semibold text-[#555]">新しいパスワード（8文字以上）</p>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-[8px] border border-[#d1d5db] px-4 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        placeholder="新しいパスワード"
      />
      {error && <p className="text-[12px] text-[#ff3158]">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-4 py-1.5 text-[13px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "変更中..." : "変更する"}
        </button>
        <button
          onClick={() => { setOpen(false); setError(""); setPassword(""); }}
          className="rounded-[8px] bg-[#e5e7eb] px-4 py-1.5 text-[13px] font-bold text-[#555]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
