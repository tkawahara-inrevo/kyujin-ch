import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { getDisplayFirstName, getDisplayLastName } from "@/lib/company-account";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { CompanyActiveToggle } from "../company-active-toggle";
import CompanyEditForm from "./company-edit-form";
import PasswordResetForm from "./password-reset-form";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      companyUser: true,
      jobs: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      },
      _count: { select: { invalidRequests: true } },
    },
  });

  if (!company) notFound();

  const totalCharges = await prisma.charge.aggregate({
    where: { isValid: true, application: { job: { companyId: id } } },
    _sum: { amount: true },
  });

  const contactLastName = company.companyUser ? getDisplayLastName(company.companyUser) : "";
  const contactFirstName = company.companyUser ? getDisplayFirstName(company.companyUser) : "";

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/companies" className="text-[13px] text-[#888] hover:text-[#2f6cff]">
          ← 企業一覧
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-[#7a8ca5]">COMPANY</p>
          <h1 className="mt-1 text-[24px] font-bold text-[#1e293b]">{company.name}</h1>
        </div>
        <CompanyActiveToggle companyId={company.id} isActive={company.isActive} />
      </div>

      {/* KPI */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <KpiCard label="求人数" value={company.jobs.length} color="#2f6cff" />
        <KpiCard label="累計請求額" value={`¥${(totalCharges._sum.amount ?? 0).toLocaleString()}`} color="#10b981" />
        <KpiCard label="無効申請数" value={company._count.invalidRequests} color="#f59e0b" />
        <KpiCard label="登録日" value={company.createdAt.toLocaleDateString("ja-JP")} color="#6b7280" />
      </div>

      {/* アカウント情報 */}
      <div className="mt-6 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 text-[16px] font-bold text-[#333]">ログイン情報</h2>
        <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
          <InfoRow label="メールアドレス" value={company.companyUser?.email || "未設定"} />
          <InfoRow label="ユーザー名" value={company.companyUser?.username || "未設定"} />
          <InfoRow label="電話番号" value={company.companyUser?.phone || "未設定"} />
          <div>
            <dt className="text-[12px] font-semibold text-[#888]">パスワード</dt>
            <dd className="mt-1 flex items-center gap-3">
              {company.adminPassword ? (
                <span className="rounded-[6px] bg-[#f1f5f9] px-3 py-1 font-mono text-[14px] text-[#333]">
                  {company.adminPassword}
                </span>
              ) : (
                <span className="text-[13px] text-[#aaa]">管理者未設定</span>
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-[#f0f0f0] pt-4">
          <PasswordResetForm companyId={company.id} />
        </div>
      </div>

      {/* 企業プロフィール */}
      <div className="mt-6 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 text-[16px] font-bold text-[#333]">企業情報</h2>
        <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
          <InfoRow label="会社名" value={company.name} />
          <InfoRow label="法人番号" value={company.corporateNumber || "未設定"} />
          <InfoRow label="業種" value={company.industry || "未設定"} />
          <InfoRow label="従業員数" value={company.employeeCount || "未設定"} />
          <InfoRow label="設立年" value={company.foundedYear || "未設定"} />
          <InfoRow label="資本金" value={company.capital || "未設定"} />
          <InfoRow label="WEBサイト" value={company.websiteUrl || "未設定"} />
          <InfoRow label="所在地" value={company.location || "未設定"} />
          <InfoRow label="担当者（姓）" value={contactLastName || "未設定"} />
          <InfoRow label="担当者（名）" value={contactFirstName || "未設定"} />
        </dl>
        {company.businessDescription && (
          <div className="mt-4 rounded-[10px] bg-[#f7f9fd] p-4">
            <p className="text-[12px] font-semibold text-[#888]">事業内容</p>
            <p className="mt-1 whitespace-pre-line text-[13px] text-[#333]">{company.businessDescription}</p>
          </div>
        )}
        {company.description && (
          <div className="mt-3 rounded-[10px] bg-[#f7f9fd] p-4">
            <p className="text-[12px] font-semibold text-[#888]">会社説明</p>
            <p className="mt-1 whitespace-pre-line text-[13px] text-[#333]">{company.description}</p>
          </div>
        )}
      </div>

      {/* 編集フォーム */}
      <div className="mt-6">
        <CompanyEditForm
          companyId={company.id}
          companyName={company.name}
          corporateNumber={company.corporateNumber || ""}
          username={company.companyUser?.username || ""}
          lastName={contactLastName}
          firstName={contactFirstName}
          phone={company.companyUser?.phone || ""}
          email={company.companyUser?.email || ""}
          businessDescription={company.businessDescription || ""}
          description={company.description || ""}
          industry={company.industry || ""}
          employeeCount={company.employeeCount || ""}
          foundedYear={company.foundedYear || ""}
          capital={company.capital || ""}
          websiteUrl={company.websiteUrl || ""}
          postalCode={company.postalCode || ""}
          prefecture={company.prefecture || ""}
          city={company.city || ""}
          addressLine={company.addressLine || ""}
        />
      </div>

      {/* 求人一覧 */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">求人一覧</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">求人タイトル</th>
                <th className="px-5 py-3 font-semibold">応募数</th>
                <th className="px-5 py-3 font-semibold">PV</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">作成日</th>
              </tr>
            </thead>
            <tbody>
              {company.jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#aaa]">求人はまだありません</td>
                </tr>
              ) : (
                company.jobs.map((job) => (
                  <tr key={job.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/jobs/${job.id}`} className="hover:text-[#2f6cff] hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{job._count.applications}</td>
                    <td className="px-5 py-3 text-[#555]">{job.viewCount}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[job.reviewStatus]}`}>
                        {JOB_REVIEW_STATUS_LABELS[job.reviewStatus]}
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
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold text-[#888]">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-[#333]">{value}</dd>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-semibold text-[#888]">{label}</p>
      <p className="mt-2 text-[22px] font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
