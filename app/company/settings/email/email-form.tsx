"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeCompanyEmail } from "@/app/actions/company/email";

export default function EmailChangeForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword || !newEmail) {
      setError("すべての項目を入力してください");
      return;
    }

    startTransition(async () => {
      try {
        await changeCompanyEmail(currentPassword, newEmail);
        setSuccess(true);
        setCurrentPassword("");
        setNewEmail("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "変更に失敗しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {error && (
        <div className="rounded-[8px] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">{error}</div>
      )}
      {success && (
        <div className="rounded-[8px] bg-[#ecfdf5] px-4 py-3 text-[13px] font-medium text-[#047857]">メールアドレスを変更しました</div>
      )}
      <div>
        <label className="mb-1.5 block text-[13px] font-bold text-[#333]">現在のパスワード</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-[6px] border border-[#d0d7e6] px-3 py-2 text-[14px] outline-none focus:border-[#1d63e3]"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-bold text-[#333]">新しいメールアドレス</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full rounded-[6px] border border-[#d0d7e6] px-3 py-2 text-[14px] outline-none focus:border-[#1d63e3]"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-[8px] bg-[#1d63e3] px-6 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "変更中..." : "変更する"}
      </button>
    </form>
  );
}
