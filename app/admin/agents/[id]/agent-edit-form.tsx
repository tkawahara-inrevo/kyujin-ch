"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAgent } from "@/app/actions/admin/agents";

type Props = {
  agentId: string;
  initialName: string;
  initialEmail: string;
  initialContactName: string;
  initialPhone: string;
  initialIsActive: boolean;
};

export default function AgentEditForm({
  agentId,
  initialName,
  initialEmail,
  initialContactName,
  initialPhone,
  initialIsActive,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [contactName, setContactName] = useState(initialContactName);
  const [phone, setPhone] = useState(initialPhone);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateAgent(agentId, { name, email, contactName, phone, isActive });
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {error && <p className="rounded bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">{error}</p>}
      {success && <p className="rounded bg-[#f0fdf4] px-3 py-2 text-[13px] text-[#047857]">更新しました</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-[12px] font-bold text-[#666]">代理店名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-[#666]">メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-[#666]">担当者名</label>
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[13px]" />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-[#666]">電話番号</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border border-[#dadfe8] px-3 py-2 text-[13px]" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        有効 (無効化するとログイン不可)
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
