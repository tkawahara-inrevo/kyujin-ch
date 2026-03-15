"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { sendMessage } from "@/app/actions/messages";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type MessageItem = {
  id: string;
  body: string;
  attachmentName?: string | null;
  senderType: string;
  senderId: string;
  createdAt: Date;
};

type MessageThreadProps = {
  conversationId: string;
  messages: MessageItem[];
  currentUserId: string;
};

export function MessageThread({
  conversationId,
  messages,
  currentUserId,
}: MessageThreadProps) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function scrollThreadToBottom(behavior?: ScrollBehavior) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  }

  // 初回表示時に最下部にスクロール
  useEffect(() => {
    scrollThreadToBottom();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const nextFile = e.target.files?.[0];
    if (!nextFile) return;
    if (!ALLOWED_TYPES.includes(nextFile.type)) {
      setFileError("対応形式: PDF, DOCX, XLSX のみ");
      e.target.value = "";
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFileError("ファイルサイズは10MB以下にしてください");
      e.target.value = "";
      return;
    }
    setFile(nextFile);
  }

  function handleSend() {
    if ((!body.trim() && !file) || isPending) return;
    startTransition(async () => {
      let attachment:
        | { attachmentUrl: string; attachmentName: string; attachmentType?: string }
        | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", conversationId);

        const res = await fetch("/api/user/message-attachments", {
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

      const text = body.trim();
      if (!text && !attachment) return;

      await sendMessage(conversationId, text, attachment);
      setBody("");
      setFile(null);
      setFileError("");
      if (fileRef.current) fileRef.current.value = "";
      scrollThreadToBottom("smooth");
    });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
      {/* メッセージエリア */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f5f5f5] p-4" style={{ maxHeight: "500px", minHeight: "300px" }}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[#aaa]">
              まだメッセージはありません
            </p>
          )}
          {messages.map((message) => {
            const mine =
              message.senderType === "USER" && message.senderId === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                id={message.id}
                text={message.body}
                attachmentName={message.attachmentName}
                timestamp={new Date(message.createdAt).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                mine={mine}
              />
            );
          })}
          <div />
        </div>
      </div>

      {/* 入力エリア */}
      <div className="border-t border-[#e5e5e5] bg-white p-3">
        {file && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#f0f5ff] px-3 py-1.5 text-[12px] text-[#2f6cff]">
            <span>📎 {file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="ml-auto text-[#999] hover:text-[#666]"
            >
              ✕
            </button>
          </div>
        )}
        {fileError && <p className="mb-2 text-[12px] text-red-500">{fileError}</p>}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-[#888] transition hover:bg-[#e5e5e5]"
            title="ファイル添付 (PDF, DOCX, XLSX)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPending}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-2.5 text-[14px] outline-none transition focus:border-[#2f6cff] focus:bg-white disabled:opacity-60"
            placeholder="メッセージを入力..."
          />
          <button
            onClick={handleSend}
            disabled={isPending || (!body.trim() && !file)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2f6cff] text-white transition hover:opacity-90 disabled:bg-[#ccc]"
          >
            {isPending ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="56" strokeDashoffset="14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
