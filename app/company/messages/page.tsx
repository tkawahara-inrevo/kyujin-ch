import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ jobId?: string }>;

export default async function CompanyMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireCompany();
  const { jobId } = await searchParams;

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const [jobs, conversations] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: company.id, isDeleted: false },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      where: {
        application: {
          job: {
            companyId: company.id,
            ...(jobId ? { id: jobId } : {}),
          },
        },
      },
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
    }),
  ]);

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">メッセージ</h1>

      <form action="/company/messages" className="mt-8">
        <div className="flex max-w-[420px] items-end gap-3">
          <div className="flex-1">
          <label className="mb-2 block text-[14px] font-bold text-[#444]">絞り込み条件</label>
          <select
            name="jobId"
            defaultValue={jobId ?? ""}
            className="w-full rounded-[10px] border border-[#d6dce8] bg-white px-4 py-3 text-[14px] text-[#333] outline-none focus:border-[#2f6cff]"
          >
            <option value="">応募求人</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
          <button
            type="submit"
            className="rounded-[10px] bg-[#2f6cff] px-5 py-3 text-[14px] font-bold text-white"
          >
            反映
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-5">
        {conversations.length === 0 ? (
          <div className="rounded-[18px] bg-white px-6 py-10 text-center text-[#9aa3b2] shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
            条件に合うメッセージはありません
          </div>
        ) : (
          conversations.map((conversation) => {
            const lastMessage = conversation.messages[0];
            return (
              <Link
                key={conversation.id}
                href={`/company/applicants/${conversation.applicationId}`}
                className="flex items-center justify-between gap-6 rounded-[18px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,56,88,0.08)]"
              >
                <div className="min-w-0 flex-1">
                  {conversation._count.messages > 0 ? (
                    <span className="inline-flex rounded-full bg-[#2f6cff] px-4 py-1 text-[12px] font-bold text-white">
                      未読
                    </span>
                  ) : null}
                  <p className="mt-3 truncate text-[18px] font-bold text-[#2b2f38]">
                    {conversation.application.user.name}
                  </p>
                  <p className="mt-2 text-[16px] font-bold text-[#444]">{conversation.application.job.title}</p>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-[1.8] text-[#666]">
                    {lastMessage?.body || (lastMessage?.attachmentName ? `📎 ${lastMessage.attachmentName}` : "まだメッセージはありません")}
                  </p>
                  <p className="mt-3 text-[13px] text-[#9aa3b2]">
                    更新日 {lastMessage ? lastMessage.createdAt.toLocaleDateString("ja-JP") : "-"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {conversation._count.messages > 0 ? (
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff3158] px-2 text-[12px] font-bold text-white">
                      {conversation._count.messages > 99 ? "99+" : conversation._count.messages}
                    </span>
                  ) : null}
                  <span className="text-[28px] leading-none text-[#222]">→</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
