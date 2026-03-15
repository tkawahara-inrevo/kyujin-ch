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
      className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3.5 transition hover:bg-[#fafafa] ${
        unread ? "border-[#2f6cff]/30 bg-[#f8faff]" : "border-[#e8e8e8]"
      }`}
    >
      {/* アバター */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[14px] font-bold text-[#2f6cff]">
        {companyName.charAt(0)}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-bold text-[#333]">{companyName}</p>
          {unread && (
            <span className="flex h-[20px] min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-[11px] text-[#aaa]">{updatedAt}</span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-[#888]">{title}</p>
        {lastMessage && (
          <p className="mt-0.5 truncate text-[13px] text-[#666]">{lastMessage}</p>
        )}
      </div>

      {/* 矢印 */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
