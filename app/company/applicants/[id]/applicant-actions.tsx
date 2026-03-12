"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus, sendCompanyMessage } from "@/app/actions/company/applicants";

const STATUSES: { value: string; label: string }[] = [
  { value: "APPLIED", label: "応募済" },
  { value: "REVIEWING", label: "選考中" },
  { value: "INTERVIEW", label: "面接" },
  { value: "OFFER", label: "内定" },
  { value: "HIRED", label: "採用" },
  { value: "REJECTED", label: "不採用" },
];

type Message = {
  id: string;
  senderId: string;
  senderType: string;
  body: string;
  createdAt: Date;
};

export function ApplicantActions({
  applicationId,
  currentStatus,
  messages,
}: {
  applicationId: string;
  currentStatus: string;
  messages: Message[];
}) {
  const [isPending, startTransition] = useTransition();
  const [msgBody, setMsgBody] = useState("");

  function handleStatusChange(status: string) {
    startTransition(() => updateApplicationStatus(applicationId, status));
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgBody.trim()) return;
    startTransition(async () => {
      await sendCompanyMessage(applicationId, msgBody.trim());
      setMsgBody("");
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* ステータス変更 */}
      <div>
        <h3 className="text-[13px] font-bold text-[#888]">ステータス変更</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={isPending || s.value === currentStatus}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                s.value === currentStatus
                  ? "bg-[#2f6cff] text-white"
                  : "bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]"
              } disabled:opacity-50`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージスレッド */}
      <div>
        <h3 className="text-[13px] font-bold text-[#888]">メッセージ</h3>
        <div className="mt-2 max-h-[300px] space-y-2 overflow-y-auto rounded-[8px] border border-[#eee] p-3">
          {messages.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-[#aaa]">メッセージはまだありません</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-[8px] px-3 py-2 text-[13px] ${
                  msg.senderType === "COMPANY"
                    ? "ml-8 bg-[#2f6cff]/10 text-[#333]"
                    : "mr-8 bg-[#f5f5f5] text-[#333]"
                }`}
              >
                <p className="text-[11px] font-semibold text-[#888]">
                  {msg.senderType === "COMPANY" ? "企業" : "求職者"}
                </p>
                <p className="mt-0.5">{msg.body}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
          <input
            value={msgBody}
            onChange={(e) => setMsgBody(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-[8px] border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
          />
          <button
            type="submit"
            disabled={isPending || !msgBody.trim()}
            className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
