"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { sendCompanyMessage } from "@/app/actions/company/applicants";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Message = {
  id: string;
  senderType: string;
  body: string;
  attachmentName?: string | null;
  createdAt: Date;
};

function InfoBadge({
  href,
  label,
  active = true,
}: {
  href?: string | null;
  label: string;
  active?: boolean;
}) {
  if (!active || !href) {
    return (
      <span className="inline-flex rounded-full bg-[#e5e7eb] px-3 py-1 text-[12px] font-bold text-[#8d97a6]">
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full bg-[#2f6cff] px-3 py-1 text-[12px] font-bold text-white transition hover:opacity-90"
    >
      {label}
    </a>
  );
}

export function MessageThreadPanel({
  applicationId,
  applicantName,
  jobTitle,
  messages,
  resumeHref,
  careerHistoryHref,
  isInvalidated = false,
}: {
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  messages: Message[];
  resumeHref?: string | null;
  careerHistoryHref?: string | null;
  isInvalidated?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [msgBody, setMsgBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [applicationId, messages.length]);

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

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
      <div className="border-b border-[#edf1f7] pb-4">
        <h2 className="text-[18px] font-bold text-[#2f6cff]">メッセージ</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px]">
          <span className="font-bold text-[#2b2f38]">{applicantName} さん</span>
          <span className="text-[#8f97a5]">{jobTitle}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <InfoBadge href={resumeHref} label="履歴書あり" active={!!resumeHref} />
          <InfoBadge href={careerHistoryHref} label="職務経歴書あり" active={!!careerHistoryHref} />
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-[#f7f9fc] p-4">
        {isInvalidated ? (
          <div className="rounded-[18px] bg-white px-5 py-6 text-[13px] text-[#8f97a5]">
            無効化されているため閲覧ができません
          </div>
        ) : (
          <>
            <div
              ref={scrollAreaRef}
              className="max-h-[52vh] min-h-[360px] space-y-3 overflow-y-auto pr-1"
            >
              {messages.length === 0 ? (
                <div className="rounded-[18px] bg-white px-5 py-10 text-center text-[13px] text-[#9aa3b2]">
                  まだメッセージはありません
                </div>
              ) : (
                messages.map((message) => {
                  const isCompany = message.senderType === "COMPANY";
                  return (
                    <div key={message.id} className={`flex ${isCompany ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] ${isCompany ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-[18px] px-5 py-4 text-[14px] leading-[1.8] ${
                            isCompany
                              ? "bg-[#2f6cff] text-white"
                              : "bg-white text-[#2b2f38]"
                          }`}
                        >
                          {message.body ? <p className="whitespace-pre-wrap">{message.body}</p> : null}
                          {message.attachmentName ? (
                            <a
                              href={`/api/messages/attachments/${message.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-bold ${
                                isCompany
                                  ? "bg-white/15 text-white"
                                  : "bg-[#eef4ff] text-[#2f6cff]"
                              }`}
                            >
                              <span>添付</span>
                              <span className="truncate">{message.attachmentName}</span>
                            </a>
                          ) : null}
                        </div>
                        <p className={`mt-1 text-[12px] text-[#9aa3b2] ${isCompany ? "text-right" : "text-left"}`}>
                          {new Date(message.createdAt).toLocaleString("ja-JP")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex items-end gap-4">
              <div className="flex-1">
                {file ? (
                  <div className="mb-2 flex items-center gap-2 rounded-[12px] bg-[#eef4ff] px-3 py-2 text-[12px] text-[#2f6cff]">
                    <span className="truncate">添付: {file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="ml-auto text-[#6b7280]"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                {fileError ? <p className="mb-2 text-[12px] text-[#ef4444]">{fileError}</p> : null}

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-white text-[#8f97a5] shadow-[0_2px_8px_rgba(37,56,88,0.05)] transition hover:bg-[#f8fafc]"
                    title="添付ファイル"
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

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <textarea
                    value={msgBody}
                    onChange={(event) => setMsgBody(event.target.value)}
                    placeholder="メッセージを書く..."
                    rows={3}
                    className="min-h-[76px] flex-1 resize-none rounded-[18px] border border-[#d8e0ec] bg-white px-6 py-5 text-[14px] outline-none transition focus:border-[#2f6cff]"
                  />

                  <button
                    type="submit"
                    disabled={isPending || (!msgBody.trim() && !file)}
                    className="h-[78px] min-w-[100px] rounded-[18px] bg-[#8f9094] px-6 text-[24px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    送信
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
