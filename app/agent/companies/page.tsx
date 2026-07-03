import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAgentSession } from "@/lib/agent-session";

export default async function AgentCompaniesPage() {
  const agent = await requireAgentSession();

  // この代理店に紐付いた企業と、その求人 / 応募数
  const companies = await prisma.company.findMany({
    where: { agentId: agent.id, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      corporateNumber: true,
      jobs: {
        where: { isDeleted: false },
        select: {
          id: true,
          isPublished: true,
          reviewStatus: true,
          _count: { select: { applications: true } },
        },
      },
    },
  });

  const rows = companies.map((c) => {
    const publishedJobsCount = c.jobs.filter((j) => j.isPublished && j.reviewStatus === "PUBLISHED").length;
    const totalApplications = c.jobs.reduce((sum, j) => sum + j._count.applications, 0);
    return {
      id: c.id,
      name: c.name,
      corporateNumber: c.corporateNumber,
      publishedJobsCount,
      totalApplications,
    };
  });

  const totalJobs = rows.reduce((s, r) => s + r.publishedJobsCount, 0);
  const totalApplications = rows.reduce((s, r) => s + r.totalApplications, 0);

  return (
    <div>
      <h1 className="text-[22px] font-bold text-[#1e293b]">紹介企業一覧</h1>
      <p className="mt-2 text-[13px] text-[#666]">
        {agent.name} 様がご紹介いただいた企業の応募状況です。
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="紐付企業数" value={rows.length.toString()} />
        <StatCard label="公開中の求人数 (合計)" value={totalJobs.toString()} />
        <StatCard label="応募者数 (合計)" value={totalApplications.toString()} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-[13px]">
          <thead className="bg-[#f8fafc]">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold text-[#666]">会社名</th>
              <th className="px-4 py-3 font-bold text-[#666]">法人番号</th>
              <th className="px-4 py-3 text-center font-bold text-[#666]">公開中の求人数</th>
              <th className="px-4 py-3 text-center font-bold text-[#666]">応募者数 (合計)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#888]">
                  現在ご紹介いただいた企業はありません。
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-[#eef2f7] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <Link href={`/agent/companies/${r.id}`} className="font-bold text-[#1e293b] hover:text-[#2f6cff]">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#666]">{r.corporateNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#1e293b]">{r.publishedJobsCount}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#2f6cff]">{r.totalApplications}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/agent/companies/${r.id}`}
                      className="rounded border border-[#dadfe8] px-3 py-1 text-[12px] font-bold text-[#444] hover:bg-[#f4f7fb]"
                    >
                      詳細
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] font-bold text-[#888]">{label}</p>
      <p className="mt-1 text-[24px] font-bold text-[#2f6cff]">{value}</p>
    </div>
  );
}
