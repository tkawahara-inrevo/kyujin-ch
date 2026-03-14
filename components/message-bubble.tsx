type MessageBubbleProps = {
  id: string;
  text: string;
  timestamp: string;
  attachmentName?: string | null;
  mine?: boolean;
};

export function MessageBubble({
  id,
  text,
  timestamp,
  attachmentName,
  mine = false,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            mine
              ? "rounded-br-md bg-[#2f6cff] text-white"
              : "rounded-bl-md bg-white text-[#333] shadow-sm"
          }`}
        >
          {text && <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{text}</p>}
          {attachmentName && (
            <a
              href={`/api/messages/attachments/${id}`}
              target="_blank"
              rel="noreferrer"
              className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold ${
                mine
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-[#f3f6ff] text-[#2f6cff] hover:bg-[#e7eeff]"
              }`}
            >
              <span>📎</span>
              <span className="truncate">{attachmentName}</span>
            </a>
          )}
        </div>
        <p
          className={`mt-1 text-[11px] text-[#aaa] ${mine ? "text-right" : "text-left"}`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}
