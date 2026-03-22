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
    conversations.find((conversation) => conversation.applicationId === applicationId) ??
    conversations[0] ??
    null;

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
  const backHref = jobId ? `/company/messages?jobId=${jobId}` : "/company/messages";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden px-4 py-6 md:px-8 md:py-8 xl:px-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">メッセージ</h1>

      <div className="mt-6 hidden min-h-0 flex-1 gap-5 xl:flex">
        <div className="flex min-h-0 w-[280px] shrink-0 flex-col gap-4 overflow-hidden xl:w-[320px]">
          <MessageJobFilter jobs={jobs} currentJobId={jobId} />

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
            {conversations.length === 0 ? (
              <div className="rounded-[22px] bg-white px-5 py-10 text-center text-[13px] text-[#9aa3b2] shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
                条件に合うメッセージはありません
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = selectedApplicationId === conversation.applicationId;
                const unreadCount = isActive ? 0 : conversation._count.messages;
                const updatedAt = conversation.messages[0]?.createdAt ?? conversation.updatedAt;

                return (
                  <Link
                    key={conversation.id}
                    href={buildMessagesHref(jobId, conversation.applicationId)}
                    className={`block rounded-[18px] border px-4 py-3 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition ${
                      isActive
                        ? "border-[#d8e7ff] bg-[#eef4ff]"
                        : "border-transparent bg-white hover:-translate-y-0.5 hover:border-[#e5ebf5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[16px] font-bold text-[#2b2f38]">
                            {conversation.application.user.name}
                          </p>
                          {unreadCount > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[10px] font-bold text-white">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.5] text-[#475467]">
                          {conversation.application.job.title}
                        </p>
                      </div>
                      <p className="shrink-0 text-[11px] text-[#98a2b3]">
                        {new Date(updatedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
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

      <div className="mt-6 min-h-0 flex-1 xl:hidden">
        {applicationId && selectedApplication && selectedApplication.conversation ? (
          <MessageThreadPanel
            applicationId={selectedApplication.id}
            applicantName={selectedApplication.user.name ?? "応募者"}
            jobTitle={selectedApplication.job.title}
            messages={selectedApplication.conversation.messages}
            resumeHref={resumeHref}
            careerHistoryHref={careerHistoryHref}
            isInvalidated={selectedApplication.invalidRequests.length > 0}
            mobileBackHref={backHref}
          />
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0">
              <MessageJobFilter jobs={jobs} currentJobId={jobId} />
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="rounded-[18px] bg-white px-5 py-10 text-center text-[13px] text-[#9aa3b2] shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
                  条件に合うメッセージはありません
                </div>
              ) : (
                conversations.map((conversation) => {
                  const unreadCount = conversation._count.messages;
                  const updatedAt = conversation.messages[0]?.createdAt ?? conversation.updatedAt;

                  return (
                    <Link
                      key={conversation.id}
                      href={buildMessagesHref(jobId, conversation.applicationId)}
                      className="block rounded-[18px] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition hover:bg-[#fafcff]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[16px] font-bold text-[#2b2f38]">
                              {conversation.application.user.name}
                            </p>
                            {unreadCount > 0 ? (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[10px] font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.5] text-[#475467]">
                            {conversation.application.job.title}
                          </p>
                        </div>
                        <p className="shrink-0 text-[11px] text-[#98a2b3]">
                          {new Date(updatedAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
