"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email: adminId, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("IDまたはパスワードが正しくありません");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e293b]">
      <div className="w-full max-w-[420px] rounded-[16px] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-[#1e293b]">管理画面</h1>
          <p className="mt-1 text-[14px] text-[#888]">管理者ログイン</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">管理者ID</label>
            <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} required className="w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#1e293b]" placeholder="IDまたはメールアドレス" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#444]">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-[8px] border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#1e293b]" />
          </div>
          {error && <p className="text-[13px] font-medium text-[#ff3158]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-[10px] bg-[#1e293b] py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
