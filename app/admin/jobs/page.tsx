import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminJobsPage() {
  await requireAdmin();

  const jobs = await prisma.job.findMany({
    where: { isDeleted: false },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">求人一覧</h1>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">求人タイトル</th>
              <th className="px-5 py-3 font-semibold">企業</th>
              <th className="px-5 py-3 font-semibold">応募数</th>
              <th className="px-5 py-3 font-semibold">PV</th>
              <th className="px-5 py-3 font-semibold">公開</th>
              <th className="px-5 py-3 font-semibold">作成日</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">求人がありません</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 font-medium text-[#333]">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:text-[#2f6cff] hover:underline">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#555]">
                    <Link href={`/admin/companies/${job.companyId}`} className="hover:text-[#2f6cff] hover:underline">
                      {job.company.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#555]">{job._count.applications}</td>
                  <td className="px-5 py-3 text-[#555]">{job.viewCount}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      job.isPublished ? "bg-[#d1fae5] text-[#059669]" : "bg-[#f3f4f6] text-[#888]"
                    }`}>
                      {job.isPublished ? "公開" : "非公開"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#888]">{job.createdAt.toLocaleDateString("ja-JP")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
