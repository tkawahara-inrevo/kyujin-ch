"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agentLogin } from "@/app/actions/agent/auth";

export default function AgentLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    startTransition(async () => {
      const r = await agentLogin(fd);
      if (r.ok) {
        router.push("/agent/companies");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {error && <p className="rounded bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">{error}</p>}
      <div>
        <label className="block text-[12px] font-bold text-[#666]">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-[#666]">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[8px] bg-[#2f6cff] py-2.5 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
