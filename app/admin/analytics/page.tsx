import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    totalJobs,
    totalApps,
    monthlyApps,
    totalCharges,
    monthlyCharges,
    totalViews,
    monthlyViews,
    topJobs,
    topCompanies,
  ] = await Promise.all([
    prisma.job.count({ where: { isDeleted: false } }),
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.charge.aggregate({ where: { isValid: true }, _sum: { amount: true } }),
    prisma.charge.aggregate({ where: { isValid: true, billingMonth: thisMonth }, _sum: { amount: true }, _count: true }),
    prisma.jobView.count(),
    prisma.jobView.count({ where: { viewedAt: { gte: startOfMonth } } }),
    prisma.job.findMany({
      where: { isDeleted: false },
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
    prisma.company.findMany({
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),
  ]);

  // Calculate company-level charges
  const companyCharges = await Promise.all(
    topCompanies.map(async (c) => {
      const charges = await prisma.charge.aggregate({
        where: { isValid: true, application: { job: { companyId: c.id } } },
        _sum: { amount: true },
      });
      return { ...c, totalCharge: charges._sum.amount ?? 0 };
    })
  );
  companyCharges.sort((a, b) => b.totalCharge - a.totalCharge);

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">分析</h1>

      {/* KPI */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="総求人数" value={totalJobs} color="#2f6cff" />
        <KpiCard label="総応募数" value={totalApps} sub={`当月: ${monthlyApps}`} color="#10b981" />
        <KpiCard label="総PV" value={totalViews.toLocaleString()} sub={`当月: ${monthlyViews.toLocaleString()}`} color="#8b5cf6" />
        <KpiCard label="累計売上" value={`¥${(totalCharges._sum.amount ?? 0).toLocaleString()}`} sub={`当月: ¥${(monthlyCharges._sum.amount ?? 0).toLocaleString()} (${monthlyCharges._count}件)`} color="#f59e0b" />
      </div>

      {/* Top Jobs by PV */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">PVランキング（求人TOP10）</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="w-[40px] px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">求人タイトル</th>
                <th className="px-5 py-3 font-semibold">企業</th>
                <th className="px-5 py-3 font-semibold">PV</th>
                <th className="px-5 py-3 font-semibold">応募数</th>
                <th className="px-5 py-3 font-semibold">CVR</th>
              </tr>
            </thead>
            <tbody>
              {topJobs.map((job, i) => {
                const cvr = job.viewCount > 0
                  ? ((job._count.applications / job.viewCount) * 100).toFixed(1)
                  : "—";
                return (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-bold text-[#888]">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">{job.title}</td>
                    <td className="px-5 py-3 text-[#555]">{job.company.name}</td>
                    <td className="px-5 py-3 font-medium text-[#2f6cff]">{job.viewCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{job._count.applications}</td>
                    <td className="px-5 py-3 text-[#555]">{cvr === "—" ? cvr : `${cvr}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Companies by Revenue */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">企業別売上ランキング</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="w-[40px] px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">企業名</th>
                <th className="px-5 py-3 font-semibold">求人数</th>
                <th className="px-5 py-3 font-semibold">累計売上</th>
              </tr>
            </thead>
            <tbody>
              {companyCharges.map((c, i) => (
                <tr key={c.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 font-bold text-[#888]">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-[#333]">{c.name}</td>
                  <td className="px-5 py-3 text-[#555]">{c._count.jobs}</td>
                  <td className="px-5 py-3 font-medium text-[#10b981]">¥{c.totalCharge.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-semibold text-[#888]">{label}</p>
      <p className="mt-2 text-[28px] font-bold" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-[12px] text-[#aaa]">{sub}</p>}
    </div>
  );
}
