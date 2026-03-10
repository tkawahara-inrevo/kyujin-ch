import Link from "next/link";

type MessageListCardProps = {
  id: string;
  companyName: string;
  title: string;
  updatedAt: string;
  unread?: boolean;
};

export function MessageListCard({
  id,
  companyName,
  title,
  updatedAt,
  unread = false,
}: MessageListCardProps) {
  return (
    <Link
      href={`/messages/${id}`}
      className="block rounded-[18px] border border-[#d7d7d7] bg-white p-5 transition hover:bg-[#fcfcfc]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${
              unread ? "bg-[#2f6cff] text-white" : "bg-[#d9d9d9] text-[#444]"
            }`}
          >
            {unread ? "未読" : "既読"}
          </span>

          <p className="mt-4 text-[28px] font-bold text-[#333]">{companyName}</p>
          <p className="mt-3 text-[20px] text-[#444]">{title}</p>
          <p className="mt-3 text-[14px] text-[#999]">更新日 {updatedAt}</p>
        </div>

        <div className="pt-3 text-[24px] text-[#333]">→</div>
      </div>
    </Link>
  );
}