"use client";

import { useState } from "react";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("パスワードは8文字以上で入力してください");
    if (password !== confirm) return setError("パスワードが一致しません");

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "再設定に失敗しました");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 rounded-[10px] bg-white p-6">
        <p className="text-[14px] font-bold text-[#16a34a]">パスワードを再設定しました。</p>
        <p className="mt-2 text-[13px] text-[#555]">新しいパスワードでログインしてください。</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-[8px] bg-[#2f6cff] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
        >
          トップへ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-[10px] bg-white p-6">
      <label className="block">
        <span className="text-[13px] font-semibold text-[#444]">新しいパスワード（8文字以上）</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 block w-full rounded-[8px] border border-[#d6dde9] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#2f6cff]"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-[13px] font-semibold text-[#444]">確認用</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-1 block w-full rounded-[8px] border border-[#d6dde9] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#2f6cff]"
        />
      </label>
      {error && <p className="mt-3 text-[13px] text-[#eb0937]">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-[8px] bg-[#2f6cff] py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "再設定する"}
      </button>
    </form>
  );
}
