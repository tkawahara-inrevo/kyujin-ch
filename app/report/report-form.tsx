"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/app/actions/user/reports";

const REASONS = [
  "虚偽・誇大広告",
  "差別的・不適切な内容",
  "詐欺・スパム",
  "嫌がらせ・暴言",
  "個人情報の漏洩",
  "著作権侵害",
  "その他",
];

export function ReportForm({ targetType, targetId }: { targetType: string; targetId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!reason) {
      setError("理由を選択してください");
      return;
    }
    startTransition(async () => {
      const res = await submitReport({ targetType, targetId, reason, detail });
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-lg bg-[#ecfdf5] p-6 text-center">
        <p className="text-[16px] font-bold text-[#047857]">通報を受け付けました</p>
        <p className="mt-3 text-[13px] text-[#666]">確認次第、必要な対応を行います。</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 rounded-full bg-[#2f6cff] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#dc2626]">{error}</div>
      )}
      <div>
        <p className="mb-2 text-[13px] font-bold text-[#333]">理由 *</p>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-[14px] text-[#333]">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={(e) => setReason(e.target.value)}
                className="h-4 w-4 accent-[#2f6cff]"
              />
              {r}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-bold text-[#333]">詳細</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="具体的な状況や該当箇所をご記入ください（任意）"
          className="w-full rounded-lg border border-[#d7dee9] px-3 py-2 text-[14px] outline-none focus:border-[#2f6cff]"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-[#2f6cff] px-8 py-3 text-[14px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "送信中..." : "通報を送信する"}
      </button>
    </form>
  );
}
