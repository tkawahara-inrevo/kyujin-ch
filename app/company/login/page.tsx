"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    router.push("/company/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa]">
      <div className="w-full max-w-[420px] rounded-[16px] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-[#1e3a5f]">求人ちゃんねる</h1>
          <p className="mt-1 text-[14px] text-[#888]">企業ポータル ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]"
              placeholder="company@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#2f6cff]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-[#1e3a5f] py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
