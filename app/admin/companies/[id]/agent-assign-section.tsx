"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignAgentToCompany } from "@/app/actions/admin/agents";

type Props = {
  companyId: string;
  currentAgentId: string | null;
  allAgents: { id: string; name: string }[];
};

export default function AgentAssignSection({ companyId, currentAgentId, allAgents }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentAgentId ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    setSuccess(false);
    startTransition(async () => {
      try {
        await assignAgentToCompany(companyId, selected || null);
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
      }
    });
  }

  return (
    <div className="mt-4 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
      <p className="text-[12px] font-bold text-[#666]">紐付け代理店の変更</p>
      {error && <p className="mt-2 text-[12px] text-[#dc2626]">{error}</p>}
      {success && <p className="mt-2 text-[12px] text-[#047857]">保存しました</p>}
      <div className="mt-2 flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded border border-[#dadfe8] bg-white px-3 py-2 text-[13px]"
        >
          <option value="">-- 未紐付 --</option>
          {allAgents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
