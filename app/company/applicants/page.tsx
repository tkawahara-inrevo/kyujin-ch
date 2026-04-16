import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ApplicantsListClient } from "./applicants-list-client";
import type { ApplicationStatus } from "@prisma/client";

type SearchParams = Promise<{ jobId?: string; name?: string; statuses?: string; sort?: string }>;

const ALL_STATUSES: ApplicationStatus[] = ["APPLIED", "REVIEWING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default async function CompanyApplicantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireCompany();
  const { jobId, name, statuses, sort } = await searchParams;

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const selectedStatuses = statuses
    ? statuses.split(",").filter((s) => ALL_STATUSES.includes(s as ApplicationStatus)) as ApplicationStatus[]
    : [];

  const sortDir = sort === "asc" ? "asc" : "desc";

  const [jobs, applications] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: company.id, isDeleted: false },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: {
        job: {
          companyId: company.id,
          isDeleted: false,
          ...(jobId ? { id: jobId } : {}),
        },
        ...(name ? { user: { name: { contains: name, mode: "insensitive" } } } : {}),
        ...(selectedStatuses.length > 0 ? { status: { in: selectedStatuses } } : {}),
      },
      select: {
        id: true,
        status: true,
        note: true,
        companyViewedAt: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, deletedAt: true } },
        job: { select: { id: true, title: true } },
        conversation: {
          select: {
            id: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, body: true, senderType: true, createdAt: true, deletedBySender: true },
            },
          },
        },
      },
      orderBy: { createdAt: sortDir },
    }),
  ]);

  const rows = applications.map((app) => {
    const latestMsg = app.conversation?.messages[0];
    return {
      id: app.id,
      userName: app.user.deletedAt ? "退会済みユーザー" : (app.user.name ?? ""),
      userEmail: app.user.deletedAt ? "" : app.user.email,
      jobId: app.job.id,
      jobTitle: app.job.title,
      status: app.status,
      note: app.note ?? "",
      isUnread: app.companyViewedAt === null,
      isDeleted: !!app.user.deletedAt,
      createdAt: app.createdAt.toISOString(),
      latestMessage: latestMsg && !latestMsg.deletedBySender
        ? {
            id: latestMsg.id,
            body: latestMsg.body,
            senderType: latestMsg.senderType,
            conversationId: app.conversation!.id,
          }
        : null,
    };
  });

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">応募者管理</h1>
      <p className="mt-3 text-[13px] text-[#555]">
        ご利用の前に
        <Link href="/application-notes/" target="_blank" rel="noreferrer" className="mx-1 text-[#2f6cff] underline hover:opacity-80">
          求人ちゃんねるお申込みに関する注意事項
        </Link>
        をご確認ください。
      </p>

      <ApplicantsListClient
        jobs={jobs}
        rows={rows}
        currentJobId={jobId ?? ""}
        currentName={name ?? ""}
        currentStatuses={selectedStatuses}
        currentSort={sortDir}
      />
    </div>
  );
}
