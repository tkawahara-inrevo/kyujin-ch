"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import type { ApplicationStatus } from "@prisma/client";
import { sendCompanyMessage, updateApplicationStatus } from "@/app/actions/company/applicants";

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "APPLIED", label: "応募済み" },
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Message = {
  id: string;
  senderId: string;
  senderType: string;
  body: string;
  attachmentName?: string | null;
  createdAt: Date;
};

const STATUS_TONE: Record<string, string> = {
  APPLIED: "bg-[#e8f0ff] text-[#2f6cff]",
  REVIEWING: "bg-[#fff6db] text-[#b7791f]",
  INTERVIEW: "bg-[#efe8ff] text-[#6d28d9]",
  OFFER: "bg-[#ffe9f2] text-[#db2777]",
  HIRED: "bg-[#e8f8ef] text-[#15803d]",
  REJECTED: "bg-[#f3f4f6] text-[#6b7280]",
};

export function ApplicantActions({
  applicationId,
  currentStatus,
  messages,
  isInvalidated = false,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  messages: Message[];
  conversationId?: string;
  isInvalidated?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [msgBody, setMsgBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleStatusChange(status: ApplicationStatus) {
    if (isInvalidated) return;
    startTransition(() => updateApplicationStatus(applicationId, status));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!ALLOWED_TYPES.includes(nextFile.type)) {
      setFileError("添付ファイルは PDF / DOCX / XLSX のみ対応です");
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setFileError("ファイルサイズは10MB以下にしてください");
      event.target.value = "";
      return;
    }

    setFile(nextFile);
  }

  function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (isInvalidated) return;
    if (!msgBody.trim() && !file) return;

    startTransition(async () => {
      let attachment:
        | { attachmentUrl: string; attachmentName: string; attachmentType?: string }
        | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicationId", applicationId);

        const response = await fetch("/api/company/message-attachments", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
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

  const currentStatusLabel = STATUSES.find((status) => status.value === currentStatus)?.label ?? currentStatus;
  const displayStatusLabel = isInvalidated ? "無効" : currentStatusLabel;
  const displayStatusTone = isInvalidated
    ? "border border-[#ff8aa0] bg-white text-[#e11d48]"
    : STATUS_TONE[currentStatus] ?? "bg-[#f3f4f6] text-[#6b7280]";

  return (
    <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] xl:self-start">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-bold text-[#888]">ステータス</h3>
            <p className="mt-1 text-[12px] text-[#9aa2af]">応募状況を更新できます</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${displayStatusTone}`}>
            {displayStatusLabel}
          </span>
        </div>

        {isInvalidated ? (
          <div className="mt-4 rounded-[10px] border border-[#ffd2dc] bg-[#fff7f9] px-3 py-3 text-[12px] leading-[1.7] text-[#be123c]">
            無効申請が承認されているため、この応募者の選考操作はできません。
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">
            {STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={isPending || status.value === currentStatus}
                className={`rounded-[10px] px-3 py-2 text-[12px] font-bold transition ${
                  status.value === currentStatus
                    ? "bg-[#2f6cff] !text-white"
                    : "bg-[#f4f6f8] text-[#555] hover:bg-[#e9edf2]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#f0f0f0] px-4 py-3">
          <h3 className="text-[13px] font-bold text-[#888]">メッセージ</h3>
        </div>

        {isInvalidated ? (
          <div className="px-4 py-6 text-[13px] text-[#9aa2af]">無効化されているため閲覧ができません</div>
        ) : (
          <>
            <div className="max-h-[62vh] min-h-[420px] overflow-y-auto bg-[#f8f8f8] p-4 xl:max-h-[68vh]">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-[#aaa]">メッセージはまだありません</p>
                ) : (
                  messages.map((msg) => {
                    const isCompany = msg.senderType === "COMPANY";
                    return (
                      <div key={msg.id} className={`flex ${isCompany ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[85%] md:max-w-[75%]">
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                              isCompany
                                ? "rounded-br-md bg-[#2f6cff] text-white"
                                : "rounded-bl-md bg-white text-[#333] shadow-sm"
                            }`}
                          >
                            {msg.body ? <p className="whitespace-pre-wrap">{msg.body}</p> : null}
                            {msg.attachmentName ? (
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
                                <span>添付</span>
                                <span className="truncate">{msg.attachmentName}</span>
                              </a>
                            ) : null}
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

            <form onSubmit={handleSendMessage} className="border-t border-[#f0f0f0] p-3">
              {file ? (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#f0f5ff] px-3 py-1.5 text-[12px] text-[#2f6cff]">
                  <span>添付 {file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ml-auto text-[#999] hover:text-[#666]"
                  >
                    ×
                  </button>
                </div>
              ) : null}

              {fileError ? <p className="mb-2 text-[12px] text-red-500">{fileError}</p> : null}

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-[#888] transition hover:bg-[#e5e5e5]"
                  title="ファイル添付"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx" onChange={handleFileChange} className="hidden" />

                <textarea
                  value={msgBody}
                  onChange={(event) => setMsgBody(event.target.value)}
                  placeholder="メッセージを入力..."
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-2.5 text-[13px] outline-none transition focus:border-[#2f6cff] focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={isPending || (!msgBody.trim() && !file)}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2f6cff] text-white transition hover:opacity-90 disabled:bg-[#ccc]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
