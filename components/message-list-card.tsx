import Link from "next/link";

type MessageListCardProps = {
  id: string;
  companyName: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount?: number;
};

export function MessageListCard({
  id,
  companyName,
  title,
  lastMessage,
  updatedAt,
  unreadCount = 0,
}: MessageListCardProps) {
  const unread = unreadCount > 0;

  return (
    <Link
      href={`/messages/${id}`}
      className={`flex gap-3 rounded-[16px] border px-4 py-4 transition hover:bg-[#fafcff] ${
        unread ? "border-[#c5d9ff] bg-[#f4f8ff]" : "border-[#e8e8e8] bg-white"
      }`}
    >
      {/* アバター */}
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
        unread ? "bg-[#2f6cff] text-white" : "bg-[#eef2ff] text-[#2f6cff]"
      }`}>
        {companyName.charAt(0)}
      </div>

      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        {/* 会社名 + 未読バッジ + 日付 */}
        <div className="flex items-center gap-2">
          <span className={`truncate text-[14px] font-bold ${unread ? "text-[#1a1a2e]" : "text-[#333]"}`}>
            {companyName}
          </span>
          {unread && (
            <span className="flex h-[18px] min-w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[#ff3158] px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-[11px] text-[#aaa]">{updatedAt}</span>
        </div>
        {/* 求人名 */}
        <p className="mt-0.5 truncate text-[11px] text-[#aaa]">{title}</p>
        {/* 最新メッセージ */}
        {lastMessage ? (
          <p className={`mt-1.5 truncate text-[13px] ${unread ? "font-semibold text-[#333]" : "text-[#777]"}`}>
            {lastMessage}
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#ccc]">メッセージはまだありません</p>
        )}
      </div>
    </Link>
  );
}
