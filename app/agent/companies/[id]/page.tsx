import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAgentSession } from "@/lib/agent-session";
import { buildContactFullName } from "@/lib/company-account";
import { JOB_REVIEW_STATUS_LABELS, JOB_REVIEW_STATUS_BADGE_CLASSES } from "@/lib/job-review";

export default async function AgentCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const agent = await requireAgentSession();
  const { id } = await params;

  const company = await prisma.company.findFirst({
    where: { id, agentId: agent.id },
    include: {
      companyUser: {
        select: { name: true, firstName: true, lastName: true, email: true, phone: true },
      },
      jobs: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          reviewStatus: true,
          isPublished: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
      },
    },
  });

  if (!company) return notFound();

  const contactName = company.companyUser
    ? buildContactFullName(company.companyUser.lastName, company.companyUser.firstName) || company.companyUser.name
    : "";

  return (
    <div>
      <div className="text-[13px] text-[#666]">
        <Link href="/agent/companies" className="hover:text-[#2f6cff]">← 紹介企業一覧</Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-[#1e293b]">{company.name}</h1>
        <Link
          href={`/agent/companies/${company.id}/import`}
          className="rounded-[8px] border-2 border-[#2f6cff] bg-white px-5 py-2 text-[13px] font-bold text-[#2f6cff] hover:bg-[#eff6ff]"
        >
          📥 求人 CSV アップロード
        </Link>
      </div>

      {/* 企業情報 */}
      <section className="mt-6 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[15px] font-bold text-[#1e293b]">企業情報</h2>
        <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
          <InfoRow label="会社名" value={company.name} />
          <InfoRow label="法人番号" value={company.corporateNumber ?? "未設定"} />
          <InfoRow label="担当者名" value={contactName || "未設定"} />
          <InfoRow label="担当者メール" value={company.companyUser?.email ?? "未設定"} />
          <InfoRow label="担当者電話" value={company.companyUser?.phone ?? "未設定"} />
        </dl>
      </section>

      {/* 求人一覧 */}
      <section className="mt-6 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[15px] font-bold text-[#1e293b]">求人一覧</h2>
        <p className="mt-1 text-[12px] text-[#666]">各求人の応募数を確認できます。</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8fafc]">
              <tr className="text-left">
                <th className="px-3 py-2 font-bold text-[#666]">求人タイトル</th>
                <th className="px-3 py-2 font-bold text-[#666]">状態</th>
                <th className="px-3 py-2 text-center font-bold text-[#666]">応募数</th>
              </tr>
            </thead>
            <tbody>
              {company.jobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-[#888]">求人がまだありません。</td>
                </tr>
              ) : (
                company.jobs.map((j) => {
                  const badgeClass =
                    (JOB_REVIEW_STATUS_BADGE_CLASSES as Record<string, string>)[j.reviewStatus] ??
                    "bg-[#e5e7eb] text-[#333]";
                  const label =
                    (JOB_REVIEW_STATUS_LABELS as Record<string, string>)[j.reviewStatus] ?? j.reviewStatus;
                  return (
                    <tr key={j.id} className="border-t border-[#eef2f7]">
                      <td className="px-3 py-3 font-bold text-[#1e293b]">{j.title}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}>{label}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-[#2f6cff]">{j._count.applications}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-[#888]">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-[#1e293b]">{value}</dd>
    </div>
  );
}
