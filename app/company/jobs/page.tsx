import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { prisma } from "@/lib/prisma";
import { CompanyJobsTable } from "./company-jobs-table";

type SearchParams = Promise<{ status?: string }>;

const REVIEW_STATUS_FILTERS = new Set(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "RETURNED"]);

export default async function CompanyJobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireCompany();
  const { status } = await searchParams;

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const jobs = await prisma.job.findMany({
    where: {
      companyId: company.id,
      isDeleted: false,
      ...(status && REVIEW_STATUS_FILTERS.has(status) ? { reviewStatus: status as any } : {}),
    },
    select: {
      id: true,
      title: true,
      reviewStatus: true,
      isPublished: true,
      pendingContent: true,
      _count: { select: { applications: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  const rows = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    reviewStatus: job.reviewStatus,
    isPublished: job.isPublished,
    applicationsCount: job._count.applications,
    hasPublishedVersion:
      job.isPublished || job.reviewStatus === "PUBLISHED" || !!parsePendingContent(job.pendingContent),
  }));

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">求人管理</h1>
        <Link
          href="/company/jobs/new"
          className="inline-flex items-center justify-center rounded-[14px] bg-[#2f6cff] px-7 py-4 text-[16px] font-bold text-white transition hover:opacity-90"
        >
          求人を作成する
        </Link>
      </div>

      <CompanyJobsTable jobs={rows} currentStatus={status ?? "all"} />
    </div>
  );
}
