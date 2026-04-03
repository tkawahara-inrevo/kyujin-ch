import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "./status-badge";

type SearchParams = Promise<{ jobId?: string }>;

export default async function CompanyApplicantsPage({
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
      },
      include: { user: true, job: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">応募者管理</h1>

      <form action="/company/applicants" className="mt-8">
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

      <div className="mt-8 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        <div className="xl:hidden">
          {applications.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#9aa3b2]">条件に合う応募者はありません</div>
          ) : (
            <div className="divide-y divide-[#edf0f5]">
              {applications.map((application) => {
                const isUnread = application.companyViewedAt === null;
                return (
                  <Link
                    key={application.id}
                    href={`/company/applicants/${application.id}`}
                    className={`block px-4 py-4 transition hover:bg-[#fafcff] ${isUnread ? "bg-[#f9fbff]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="shrink-0 rounded-full bg-[#ff3158] px-2 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}
                          <p className={`truncate text-[15px] font-bold ${isUnread ? "text-[#1a1a2e]" : "text-[#333]"}`}>
                            {application.user.name}
                          </p>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.6] text-[#475467]">
                          {application.job.title}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={application.status} />
                      </div>
                    </div>
                    <p className="mt-3 text-[12px] text-[#98a2b3]">
                      応募日 {application.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden xl:block">
          <table className="w-full table-fixed text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#e8edf5] text-[#7f8795]">
                <th className="w-[92px] whitespace-nowrap px-4 py-4 font-bold">氏名</th>
                <th className="px-4 py-4 font-bold">応募求人</th>
                <th className="w-[98px] whitespace-nowrap px-3 py-4 text-center font-bold">ステータス</th>
                <th className="w-[92px] whitespace-nowrap px-3 py-4 text-center font-bold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#9aa3b2]">
                    条件に合う応募者はありません
                  </td>
                </tr>
              ) : (
                applications.map((application) => {
                  const isUnread = application.companyViewedAt === null;
                  return (
                    <tr key={application.id} className={`border-b border-[#edf0f5] last:border-b-0 ${isUnread ? "bg-[#f9fbff]" : ""}`}>
                      <td className="px-4 py-4 font-bold">
                        <Link
                          href={`/company/applicants/${application.id}`}
                          className={`flex items-center gap-2 truncate hover:text-[#2f6cff] ${isUnread ? "text-[#1a1a2e]" : "text-[#333]"}`}
                          title={application.user.name ?? ""}
                        >
                          {isUnread && (
                            <span className="shrink-0 rounded-full bg-[#ff3158] px-2 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}
                          <span className="truncate">{application.user.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[#333]">
                        <span className="block truncate" title={application.job.title}>
                          {application.job.title}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-3 py-4 text-center text-[#666]">
                        {application.createdAt.toLocaleDateString("ja-JP")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
