"use client";

import { useState, useTransition } from "react";
import { resetAgentPassword } from "@/app/actions/admin/agents";

export default function AgentPasswordResetButton({ agentId }: { agentId: string }) {
  const [tempPass, setTempPass] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    if (!confirm("パスワードを再発行してメール送信します。よろしいですか？")) return;
    setError("");
    startTransition(async () => {
      try {
        const r = await resetAgentPassword(agentId);
        setTempPass(r.temporaryPassword);
      } catch (e) {
        setError(e instanceof Error ? e.message : "再発行に失敗しました");
      }
    });
  }

  return (
    <div>
      {error && <p className="text-[12px] text-[#dc2626]">{error}</p>}
      {tempPass && (
        <p className="mb-2 rounded bg-[#eff6ff] px-3 py-2 text-[13px] text-[#1e40af]">
          仮パスワード: <code className="bg-white px-2 py-0.5 rounded">{tempPass}</code>
        </p>
      )}
      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="rounded-[8px] border border-[#f59e0b] px-4 py-2 text-[13px] font-bold text-[#b45309] hover:bg-[#fffbeb] disabled:opacity-50"
      >
        {isPending ? "処理中..." : "パスワードを再発行"}
      </button>
    </div>
  );
}
