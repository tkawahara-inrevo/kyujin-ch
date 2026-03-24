import { Prisma, type JobReviewStatus } from "@prisma/client";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";
import { JobsTable, type AdminJobRow } from "./jobs-table";

type SearchParams = Promise<{ q?: string; category?: string; status?: string }>;
const REVIEW_STATUS_FILTERS = new Set<JobReviewStatus>(["DRAFT", "PENDING_REVIEW", "PUBLISHED"]);

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { q, category, status } = await searchParams;

  const where: Prisma.JobWhereInput = {
    isDeleted: false,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { company: { name: { contains: q, mode: "insensitive" } } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { categoryTag: category } : {}),
    ...(status && REVIEW_STATUS_FILTERS.has(status as JobReviewStatus)
      ? { reviewStatus: status as JobReviewStatus }
      : { reviewStatus: { not: "RETURNED" as JobReviewStatus } }),
  };

  const [jobs, categoryTags] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.job.findMany({
      where: { isDeleted: false, categoryTag: { not: null } },
      select: { categoryTag: true },
      distinct: ["categoryTag"],
      orderBy: { categoryTag: "asc" },
    }),
  ]);

  const categories = categoryTags.map((job) => job.categoryTag!).filter(Boolean);
  const rows: AdminJobRow[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    companyId: job.companyId,
    companyName: job.company.name,
    applicationsCount: job._count.applications,
    viewCount: job.viewCount,
    reviewStatus: job.reviewStatus,
    createdAt: job.createdAt.toISOString(),
    reviewComment: job.reviewComment ?? undefined,
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">求人一覧</h1>

      <form className="mt-4 flex flex-wrap gap-2" action="/admin/jobs">
        <input
          name="q"
          defaultValue={q}
          placeholder="求人タイトル・企業名・勤務地で検索..."
          className="min-w-[220px] flex-1 rounded-lg border border-[#ddd] bg-white px-4 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        >
          <option value="">全カテゴリ</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        >
          <option value="">全ステータス</option>
          <option value="DRAFT">{JOB_REVIEW_STATUS_LABELS.DRAFT}</option>
          <option value="PENDING_REVIEW">{JOB_REVIEW_STATUS_LABELS.PENDING_REVIEW}</option>
          <option value="PUBLISHED">{JOB_REVIEW_STATUS_LABELS.PUBLISHED}</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          検索
        </button>
        {q || category || status ? (
          <Link
            href="/admin/jobs"
            className="rounded-lg border border-[#ddd] px-4 py-2 text-[13px] text-[#666] hover:bg-[#f5f5f5]"
          >
            クリア
          </Link>
        ) : null}
      </form>

      <p className="mt-3 text-[13px] text-[#888]">{jobs.length} 件</p>
      <JobsTable jobs={rows} />
    </div>
  );
}
