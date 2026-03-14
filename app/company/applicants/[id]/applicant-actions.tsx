"use client";

import { useRef, useState, useTransition } from "react";
import { updateApplicationStatus, sendCompanyMessage } from "@/app/actions/company/applicants";

const STATUSES: { value: string; label: string }[] = [
  { value: "APPLIED", label: "応募済" },
  { value: "REVIEWING", label: "選考中" },
  { value: "INTERVIEW", label: "面接" },
  { value: "OFFER", label: "内定" },
  { value: "HIRED", label: "採用" },
  { value: "REJECTED", label: "不採用" },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Message = {
  id: string;
  senderId: string;
  senderType: string;
  body: string;
  attachmentName?: string | null;
  createdAt: Date;
};

export function ApplicantActions({
  applicationId,
  currentStatus,
  messages,
  conversationId,
}: {
  applicationId: string;
  currentStatus: string;
  messages: Message[];
  conversationId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [msgBody, setMsgBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleStatusChange(status: string) {
    startTransition(() => updateApplicationStatus(applicationId, status));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("対応形式: PDF, DOCX, XLSX のみ");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError("ファイルサイズは10MB以下にしてください");
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgBody.trim() && !file) return;

    startTransition(async () => {
      let attachment:
        | { attachmentUrl: string; attachmentName: string; attachmentType?: string }
        | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicationId", applicationId);

        const res = await fetch("/api/company/message-attachments", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setFileError(data.error || "ファイルのアップロードに失敗しました");
          return;
        }

        attachment = data;
      }

      const text = msgBody.trim();
      if (!text && !attachment) return;

      await sendCompanyMessage(applicationId, text, attachment);
      setMsgBody("");
      setFile(null);
      setFileError("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="space-y-5">
      {/* ステータス変更 */}
      <div className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h3 className="text-[13px] font-bold text-[#888]">ステータス</h3>
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

      {/* メッセージ */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#f0f0f0] px-4 py-3">
          <h3 className="text-[13px] font-bold text-[#888]">メッセージ</h3>
        </div>

        {/* メッセージエリア */}
        <div className="max-h-[400px] overflow-y-auto bg-[#f8f8f8] p-4">
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[#aaa]">メッセージはまだありません</p>
            ) : (
              messages.map((msg) => {
                const isCompany = msg.senderType === "COMPANY";
                return (
                  <div key={msg.id} className={`flex ${isCompany ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%]`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                          isCompany
                            ? "rounded-br-md bg-[#2f6cff] text-white"
                            : "rounded-bl-md bg-white text-[#333] shadow-sm"
                        }`}
                      >
                        {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}
                        {msg.attachmentName && (
                          <a
                            href={`/api/messages/attachments/${msg.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold ${
                              isCompany
                                ? "bg-white/15 text-white hover:bg-white/20"
                                : "bg-[#f3f6ff] text-[#2f6cff] hover:bg-[#e7eeff]"
                            }`}
                          >
                            <span>📎</span>
                            <span className="truncate">{msg.attachmentName}</span>
                          </a>
                        )}
                      </div>
                      <p className={`mt-0.5 text-[10px] text-[#bbb] ${isCompany ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 入力エリア */}
        <form onSubmit={handleSendMessage} className="border-t border-[#f0f0f0] p-3">
          {file && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#f0f5ff] px-3 py-1.5 text-[12px] text-[#2f6cff]">
              <span>📎 {file.name}</span>
              <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="ml-auto text-[#999] hover:text-[#666]">✕</button>
            </div>
          )}
          {fileError && <p className="mb-2 text-[12px] text-red-500">{fileError}</p>}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-[#888] transition hover:bg-[#e5e5e5]"
              title="ファイル添付 (PDF, DOCX, XLSX)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx" onChange={handleFileChange} className="hidden" />
            <input
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-2 text-[13px] outline-none transition focus:border-[#2f6cff] focus:bg-white"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            />
            <button
              type="submit"
              disabled={isPending || (!msgBody.trim() && !file)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2f6cff] text-white transition hover:opacity-90 disabled:bg-[#ccc]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
