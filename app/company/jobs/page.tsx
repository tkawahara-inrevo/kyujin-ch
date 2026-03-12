import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { JobPublishToggle } from "./job-publish-toggle";
import { requireCompany } from "@/lib/auth-helpers";

export default async function CompanyJobsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, isDeleted: false },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  const employmentLabels: Record<string, string> = {
    FULL_TIME: "正社員",
    PART_TIME: "パート",
    CONTRACT: "契約社員",
    TEMPORARY: "派遣",
    INTERN: "インターン",
    OTHER: "その他",
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1e3a5f]">求人管理</h1>
        <Link
          href="/company/jobs/new"
          className="rounded-[10px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90"
        >
          求人を作成する
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">タイトル</th>
              <th className="px-5 py-3 font-semibold">雇用形態</th>
              <th className="px-5 py-3 font-semibold">公開</th>
              <th className="px-5 py-3 font-semibold">応募数</th>
              <th className="px-5 py-3 font-semibold">作成日</th>
              <th className="px-5 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">
                  求人がまだありません
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 font-medium text-[#333]">
                    <Link href={`/company/jobs/${job.id}/edit`} className="hover:text-[#2f6cff] hover:underline">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#555]">
                    {employmentLabels[job.employmentType] ?? job.employmentType}
                  </td>
                  <td className="px-5 py-3">
                    <JobPublishToggle jobId={job.id} isPublished={job.isPublished} />
                  </td>
                  <td className="px-5 py-3 text-[#555]">{job._count.applications}</td>
                  <td className="px-5 py-3 text-[#888]">
                    {job.createdAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/company/jobs/${job.id}/edit`}
                      className="text-[#2f6cff] hover:underline"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
