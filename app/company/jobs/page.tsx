import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "正社員",
  PART_TIME: "パート",
  CONTRACT: "契約社員",
  TEMPORARY: "派遣",
  INTERN: "インターン",
  OTHER: "その他",
};

export default async function CompanyJobsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, isDeleted: false },
    include: { _count: { select: { applications: true } } },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

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

      <div className="mt-8 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        <table className="w-full min-w-[860px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#e8edf5] text-[#7f8795]">
              <th className="px-5 py-5 font-bold">応募求人</th>
              <th className="px-5 py-5 font-bold">雇用形態</th>
              <th className="px-5 py-5 font-bold">ステータス</th>
              <th className="px-5 py-5 font-bold">応募数</th>
              <th className="px-5 py-5 font-bold">応募日</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[#9aa3b2]">
                  まだ求人はありません
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-[#edf0f5] last:border-b-0">
                  <td className="px-5 py-5 font-bold text-[#333]">
                    <Link href={`/company/jobs/${job.id}/edit`} className="hover:text-[#2f6cff]">
                      {job.title}
                    </Link>
                    {job.reviewComment ? (
                      <p className="mt-1 text-[12px] font-medium text-[#a16207]">
                        差し戻し理由: {job.reviewComment}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-5 font-bold text-[#333]">
                    {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
                  </td>
                  <td className="px-5 py-5">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[job.reviewStatus]}`}>
                      {JOB_REVIEW_STATUS_LABELS[job.reviewStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-5 font-bold text-[#333]">{job._count.applications}</td>
                  <td className="px-5 py-5 text-[#666]">{job.createdAt.toLocaleDateString("ja-JP")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
