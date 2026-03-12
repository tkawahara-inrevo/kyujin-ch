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
                className="flex items-center justify-between rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#fafafa]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#333]">{conv.application.user.name}</span>
                    <span className="text-[12px] text-[#aaa]">- {conv.application.job.title}</span>
                  </div>
                  {lastMsg && (
                    <p className="mt-1 truncate text-[13px] text-[#888]">{lastMsg.body}</p>
                  )}
                </div>
                <div className="ml-4 flex shrink-0 flex-col items-end gap-1">
                  {lastMsg && (
                    <span className="text-[11px] text-[#aaa]">
                      {lastMsg.createdAt.toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
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
