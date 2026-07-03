"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAgent } from "@/app/actions/admin/agents";

export default function AgentCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ agentId: string; temporaryPassword: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const r = await createAgent({ name, email, contactName, phone });
        setResult(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "登録に失敗しました");
      }
    });
  }

  if (result) {
    return (
      <div className="mt-6 rounded-[12px] border border-[#bfdbfe] bg-[#eff6ff] p-6">
        <h2 className="text-[16px] font-bold text-[#1e40af]">代理店を登録しました</h2>
        <p className="mt-2 text-[13px] text-[#1e40af]">仮パスワード付きのログイン案内メールを送信しました。</p>
        <div className="mt-4 rounded-[8px] bg-white p-4 text-[13px]">
          <p><span className="font-bold">仮パスワード:</span> <code className="bg-[#f3f4f6] px-2 py-0.5 rounded">{result.temporaryPassword}</code></p>
          <p className="mt-1 text-[11px] text-[#666]">※メールが届かない場合、このパスワードを口頭で伝えてください</p>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/agents/${result.agentId}`)}
            className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white"
          >
            詳細を見る
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/agents")}
            className="rounded-[8px] border border-[#d0d7e6] px-5 py-2 text-[13px] font-bold text-[#444]"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-[600px] space-y-4">
      {error && <p className="rounded bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">{error}</p>}

      <div>
        <label className="block text-[13px] font-bold text-[#444]">代理店名 <span className="text-[#dc2626]">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="例: グラハム株式会社"
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#444]">メールアドレス (ログインID) <span className="text-[#dc2626]">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="例: graham@example.com"
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#444]">担当者名</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="例: 田中 太郎"
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#444]">電話番号</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="例: 03-1234-5678"
          className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[8px] bg-[#2f6cff] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "登録中..." : "代理店を登録してメール送信"}
      </button>
    </form>
  );
}
