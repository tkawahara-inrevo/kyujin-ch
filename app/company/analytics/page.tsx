import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";

export default async function CompanyAnalyticsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, isDeleted: false },
    include: {
      _count: { select: { applications: true, jobViews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">分析</h1>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">求人</th>
              <th className="px-5 py-3 font-semibold">PV数</th>
              <th className="px-5 py-3 font-semibold">応募数</th>
              <th className="px-5 py-3 font-semibold">応募率</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[#aaa]">
                  求人がまだありません
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const pv = job._count.jobViews;
                const apps = job._count.applications;
                const rate = pv > 0 ? ((apps / pv) * 100).toFixed(1) : "-";
                return (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">{job.title}</td>
                    <td className="px-5 py-3 text-[#555]">{pv}</td>
                    <td className="px-5 py-3 text-[#555]">{apps}</td>
                    <td className="px-5 py-3 text-[#555]">{rate}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
