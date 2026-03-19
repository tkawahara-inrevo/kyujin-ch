import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { MessageJobFilter } from "./message-job-filter";
import { MessageThreadPanel } from "./message-thread-panel";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ jobId?: string; applicationId?: string }>;

function buildMessagesHref(jobId?: string, applicationId?: string) {
  const params = new URLSearchParams();
  if (jobId) params.set("jobId", jobId);
  if (applicationId) params.set("applicationId", applicationId);
  const query = params.toString();
  return query ? `/company/messages?${query}` : "/company/messages";
}

export default async function CompanyMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireCompany();
  const { jobId, applicationId } = await searchParams;

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true },
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
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                resumeUrl: true,
                careerHistoryUrl: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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

  const selectedConversation =
    conversations.find((conversation) => conversation.applicationId === applicationId) ?? conversations[0] ?? null;

  const selectedApplication = selectedConversation
    ? await prisma.application.findFirst({
        where: {
          id: selectedConversation.applicationId,
          job: { companyId: company.id },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              resumeUrl: true,
              careerHistoryUrl: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          invalidRequests: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
          },
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      })
    : null;

  if (selectedApplication) {
    if (!selectedApplication.companyViewedAt) {
      await prisma.application.update({
        where: { id: selectedApplication.id },
        data: { companyViewedAt: new Date() },
      });
    }

    if (selectedApplication.conversation) {
      await prisma.message.updateMany({
        where: {
          conversationId: selectedApplication.conversation.id,
          senderType: "USER",
          isRead: false,
        },
        data: { isRead: true },
      });
    }
  }

  const selectedApplicationId = selectedConversation?.applicationId;
  const resumeHref =
    selectedApplication?.user.resumeUrl && selectedApplication
      ? `/api/company/applicant-documents?applicationId=${selectedApplication.id}&docType=resume`
      : null;
  const careerHistoryHref =
    selectedApplication?.user.careerHistoryUrl && selectedApplication
      ? `/api/company/applicant-documents?applicationId=${selectedApplication.id}&docType=careerHistory`
      : null;

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">メッセージ</h1>

      <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MessageJobFilter jobs={jobs} currentJobId={jobId} />

          <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-2">
            {conversations.length === 0 ? (
              <div className="rounded-[22px] bg-white px-5 py-10 text-center text-[13px] text-[#9aa3b2] shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
                条件に合うメッセージはありません
              </div>
            ) : (
              conversations.map((conversation) => {
                const lastMessage = conversation.messages[0];
                const isActive = selectedApplicationId === conversation.applicationId;
                const unreadCount = isActive ? 0 : conversation._count.messages;

                return (
                  <Link
                    key={conversation.id}
                    href={buildMessagesHref(jobId, conversation.applicationId)}
                    className={`block rounded-[22px] px-4 py-4 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition ${
                      isActive ? "bg-[#eef4ff]" : "bg-white hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {unreadCount > 0 ? (
                          <span className="inline-flex rounded-full bg-[#2f6cff] px-4 py-1 text-[12px] font-bold text-white">
                            未読
                          </span>
                        ) : null}
                        <p className="mt-3 truncate text-[18px] font-bold text-[#2b2f38]">
                          {conversation.application.user.name}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[14px] font-semibold leading-[1.6] text-[#444]">
                          {conversation.application.job.title}
                        </p>
                        <p className="mt-2 line-clamp-3 text-[13px] leading-[1.7] text-[#666]">
                          {lastMessage?.body ||
                            (lastMessage?.attachmentName
                              ? `添付: ${lastMessage.attachmentName}`
                              : "まだメッセージはありません")}
                        </p>
                        <p className="mt-2 text-[12px] text-[#9aa3b2]">
                          更新日{" "}
                          {lastMessage
                            ? new Date(lastMessage.createdAt).toLocaleDateString("ja-JP")
                            : "-"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {unreadCount > 0 ? (
                          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff3158] px-2 text-[12px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : null}
                        <span className="text-[24px] text-[#222]">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div>
          {selectedApplication && selectedApplication.conversation ? (
            <MessageThreadPanel
              applicationId={selectedApplication.id}
              applicantName={selectedApplication.user.name ?? "応募者"}
              jobTitle={selectedApplication.job.title}
              messages={selectedApplication.conversation.messages}
              resumeHref={resumeHref}
              careerHistoryHref={careerHistoryHref}
              isInvalidated={selectedApplication.invalidRequests.length > 0}
            />
          ) : (
            <div className="rounded-[22px] bg-white px-6 py-16 text-center text-[14px] text-[#9aa3b2] shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
              左の一覧からメッセージを選ぶと、ここで会話を続けられます
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
