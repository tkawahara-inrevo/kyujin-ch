"use client";

import { useState, useTransition } from "react";
import { submitInvalidRequest } from "@/app/actions/company/invalid-request";

export function InvalidRequestButton({
  applicationId,
  hasExistingRequest,
  canRequestInvalidation,
}: {
  applicationId: string;
  hasExistingRequest: boolean;
  canRequestInvalidation: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (hasExistingRequest) {
    return (
      <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-bold text-[#d97706]">
        申請中
      </span>
    );
  }

  if (!canRequestInvalidation) {
    return (
      <span className="rounded-full bg-[#e5e7eb] px-2.5 py-1 text-[11px] font-bold text-[#6b7280]">
        確定済み
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-[#fee2e2] px-2.5 py-1 text-[11px] font-bold text-[#dc2626] hover:bg-[#fecaca]"
      >
        無効申請
      </button>
    );
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("無効申請の理由を入力してください");
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        await submitInvalidRequest(applicationId, reason.trim());
        setOpen(false);
        setReason("");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("無効申請に失敗しました");
        }
      }
    });
  };

  return (
    <div className="mt-2 rounded-[8px] border border-[#fecaca] bg-[#fef2f2] p-3">
      {error ? <p className="mb-2 text-[11px] text-[#dc2626]">{error}</p> : null}
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="無効申請の理由を入力してください"
        rows={2}
        className="w-full rounded border border-[#d1d5db] px-2 py-1.5 text-[12px] focus:border-[#dc2626] focus:outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded bg-[#dc2626] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#b91c1c] disabled:opacity-50"
        >
          {isPending ? "送信中..." : "申請する"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason("");
            setError("");
          }}
          className="rounded bg-[#e5e7eb] px-3 py-1 text-[11px] font-bold text-[#555] hover:bg-[#d1d5db]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
