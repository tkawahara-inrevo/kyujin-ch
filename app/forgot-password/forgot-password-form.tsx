"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("メールアドレスを入力してください");

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("送信に失敗しました");
      } else {
        setSent(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-[10px] bg-white p-6">
        <p className="text-[14px] font-bold text-[#16a34a]">メールを送信しました</p>
        <p className="mt-2 text-[13px] text-[#555] leading-[1.7]">
          {email} 宛にパスワード再設定リンクを送信しました。<br />
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
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
        <span className="text-[13px] font-semibold text-[#444]">メールアドレス</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="例) you@example.com"
          className="mt-1 block w-full rounded-[8px] border border-[#d6dde9] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#2f6cff]"
        />
      </label>
      {error && <p className="mt-3 text-[13px] text-[#eb0937]">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-[8px] bg-[#2f6cff] py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
