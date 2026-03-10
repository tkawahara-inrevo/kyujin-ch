type MessageBubbleProps = {
  text: string;
  timestamp: string;
  mine?: boolean;
};

export function MessageBubble({
  text,
  timestamp,
  mine = false,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[360px] rounded-[16px] px-5 py-4 ${
          mine ? "bg-[#2f6cff] text-white" : "bg-white text-[#333]"
        }`}
      >
        <p className="text-[18px] font-semibold">{text}</p>
        <p
          className={`mt-2 text-[14px] ${
            mine ? "text-white/90" : "text-[#8c8c8c]"
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}