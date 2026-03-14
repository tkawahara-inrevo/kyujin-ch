import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";

export default async function CompanyMessagesPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const conversations = await prisma.conversation.findMany({
    where: { application: { job: { companyId: company.id } } },
    include: {
                  application: { include: { user: true, job: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderType: "USER", isRead: false } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">メッセージ</h1>

      <div className="mt-6 space-y-3">
        {conversations.length === 0 ? (
          <div className="rounded-[12px] bg-white p-8 text-center text-[#aaa] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            メッセージはありません
          </div>
        ) : (
          conversations.map((conv) => {
            const lastMsg = conv.messages[0];
            const unread = conv._count.messages;
            return (
              <Link
                key={conv.id}
                href={`/company/applicants/${conv.applicationId}`}
                className="block rounded-[12px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#fafafa] md:flex md:items-center md:justify-between md:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                    <span className="truncate font-semibold text-[#333]">{conv.application.user.name}</span>
                    <span className="truncate text-[12px] text-[#aaa] md:max-w-[320px]">- {conv.application.job.title}</span>
                  </div>
                  {lastMsg && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[1.5] text-[#888] md:mt-1 md:truncate">
                      {lastMsg.body || (lastMsg.attachmentName ? `📎 ${lastMsg.attachmentName}` : "")}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 md:ml-4 md:mt-0 md:w-auto md:flex-col md:items-end md:gap-1">
                  {lastMsg && (
                    <span className="text-[11px] text-[#aaa]">
                      {lastMsg.createdAt.toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
