"use client";

import { useRef, useState, useTransition } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { sendMessage } from "@/app/actions/messages";

type MessageItem = {
  id: string;
  body: string;
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
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleSend() {
    if (!body.trim() || isPending) return;
    const text = body;
    setBody("");
    startTransition(async () => {
      await sendMessage(conversationId, text);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="rounded-[18px] border border-[#d7d7d7] bg-white p-4">
      <div className="max-h-[400px] overflow-y-auto rounded-[16px] bg-[#f5f5f5] p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const mine =
              message.senderType === "USER" && message.senderId === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                text={message.body}
                timestamp={new Date(message.createdAt).toLocaleString("ja-JP")}
                mine={mine}
              />
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="h-[64px] flex-1 rounded-[14px] border border-[#cfcfcf] bg-white px-5 text-[18px] outline-none disabled:opacity-60"
          placeholder="メッセージを書く..."
        />
        <button
          onClick={handleSend}
          disabled={isPending || !body.trim()}
          className="h-[64px] min-w-[110px] rounded-[14px] bg-[#2f6cff] px-6 text-[16px] font-bold text-white transition hover:opacity-90 disabled:bg-[#a5a5a5]"
        >
          {isPending ? "送信中" : "送信"}
        </button>
      </div>
    </section>
  );
}
