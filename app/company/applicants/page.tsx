import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { requireCompany } from "@/lib/auth-helpers";

export default async function CompanyApplicantsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const applications = await prisma.application.findMany({
    where: { job: { companyId: company.id, isDeleted: false } },
    include: { user: true, job: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">応募者管理</h1>
      <p className="mt-1 text-[14px] text-[#888]">{applications.length} 件</p>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">氏名</th>
              <th className="px-5 py-3 font-semibold">応募求人</th>
              <th className="px-5 py-3 font-semibold">ステータス</th>
              <th className="px-5 py-3 font-semibold">応募日</th>
              <th className="px-5 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#aaa]">
                  応募者がまだいません
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 font-medium text-[#333]">{app.user.name}</td>
                  <td className="px-5 py-3 text-[#555]">{app.job.title}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-5 py-3 text-[#888]">{app.createdAt.toLocaleDateString("ja-JP")}</td>
                  <td className="px-5 py-3">
                    <Link href={`/company/applicants/${app.id}`} className="text-[#2f6cff] hover:underline">
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
