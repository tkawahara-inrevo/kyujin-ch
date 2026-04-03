import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { prisma } from "@/lib/prisma";
import { JobReviewActions } from "./job-review-actions";
import type { YouthYearStats } from "@/app/actions/company/jobs";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "正社員",
  PART_TIME: "パート・アルバイト",
  CONTRACT: "契約社員",
  TEMPORARY: "派遣",
  INTERN: "インターン",
  OTHER: "その他",
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "応募済み",
  REVIEWING: "書類選考",
  INTERVIEW: "面接",
  OFFER: "内定",
  REJECTED: "不採用",
  HIRED: "採用",
};

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: {
        include: { user: true, charge: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  const pendingContent = job.reviewStatus === "PENDING_REVIEW" ? parsePendingContent(job.pendingContent) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = pendingContent
    ? { ...job, ...pendingContent, closingDate: pendingContent.closingDate ? new Date(pendingContent.closingDate) : job.closingDate }
    : job;

  const totalCharges = await prisma.charge.aggregate({
    where: { isValid: true, application: { jobId: id } },
    _sum: { amount: true },
    _count: true,
  });

  const youthStats: YouthYearStats[] | null = Array.isArray(d.youthEmploymentStats) ? d.youthEmploymentStats : null;

  function fmtYen(v: number | null | undefined) {
    if (!v) return null;
    return v >= 10000 ? `${Math.round(v / 10000)}万円 (${v.toLocaleString()}円)` : `${v.toLocaleString()}円`;
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#888]">
        <Link href="/admin/jobs" className="hover:text-[#2f6cff]">求人一覧</Link>
        <span>/</span>
        <Link href={`/admin/companies/${job.companyId}`} className="hover:text-[#2f6cff]">{job.company.name}</Link>
      </div>

      {/* Title + status */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">{d.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${JOB_REVIEW_STATUS_BADGE_CLASSES[job.reviewStatus]}`}>
              {JOB_REVIEW_STATUS_LABELS[job.reviewStatus]}
            </span>
            {pendingContent && (
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#2563eb]">
                公開中の求人を差し替え審査中
              </span>
            )}
            {job.reviewComment && (
              <span className="text-[13px] text-[#a16207]">差し戻し理由: {job.reviewComment}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-[#888]">
          <span>PV: {job.viewCount}</span>
          <span>応募: {job.applications.length}</span>
          <span>投稿: {job.createdAt.toLocaleDateString("ja-JP")}</span>
        </div>
      </div>

      {/* Main grid: content + actions */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Left: full job content */}
        <div className="space-y-4">
          {pendingContent && (
            <p className="rounded-[10px] border border-[#dbe4ff] bg-[#f5f8ff] px-4 py-3 text-[13px] leading-[1.7] text-[#587199]">
              この求人は公開を継続したまま差し替え審査に出されています。承認すると現在公開中の内容がこの編集内容に置き換わります。
            </p>
          )}

          {/* 基本情報 */}
          <JobSection title="基本情報">
            <Row label="会社" value={<Link href={`/admin/companies/${job.companyId}`} className="text-[#2f6cff] hover:underline">{job.company.name}</Link>} />
            <Row label="対象" value={d.targetType === "NEW_GRAD" ? `新卒（${d.graduationYear ?? ""}年卒）` : "中途"} />
            <Row label="雇用形態" value={`${EMPLOYMENT_TYPE_LABELS[d.employmentType] ?? d.employmentType}${d.employmentTypeDetail ? `（${d.employmentTypeDetail}）` : ""}`} />
            <Row label="雇用期間" value={d.employmentPeriodType || null} />
            <Row label="カテゴリ" value={`${d.categoryTag ?? ""}${d.categoryTagDetail ? `（${d.categoryTagDetail}）` : ""}`} />
            <Row label="タグ" value={d.tags?.length ? d.tags.join("、") : null} />
            <Row label="掲載終了日" value={d.closingDate ? new Date(d.closingDate).toLocaleDateString("ja-JP") : null} />
          </JobSection>

          {/* 給与 */}
          <JobSection title="給与">
            <Row label="給与タイプ" value={
              d.salaryType === "annual" ? "年俸" :
              d.salaryType === "monthly" ? "月給" :
              d.salaryType === "daily" ? "日給" :
              d.salaryType === "hourly" ? "時給" : d.salaryType
            } />
            <Row label="給与下限" value={fmtYen(d.salaryMin)} />
            <Row label="給与上限" value={fmtYen(d.salaryMax)} />
            <Row label="給与テキスト" value={d.monthlySalary || null} />
            <Row label="年俸支払方法" value={
              d.annualPaymentMethod === "monthly" ? "年俸の1/12を毎月支給" :
              d.annualPaymentMethod === "other" ? "そのほか" : d.annualPaymentMethod
            } />
            <Row label="支払方法補足" value={d.annualPaymentNote || null} />
            <Row label="みなし残業" value={d.hasFixedOvertime === true ? "あり" : d.hasFixedOvertime === false ? "なし" : null} />
            <Row label="みなし残業詳細" value={d.fixedOvertime || null} />
            <Row label="昇給・賞与" value={d.salaryRevision || null} />
            <Row label="賞与" value={d.bonus || null} />
          </JobSection>

          {/* 試用期間 */}
          <JobSection title="試用期間">
            <Row label="試用期間" value={
              d.trialPeriodExists === true ? "あり" :
              d.trialPeriodExists === false ? "なし" : null
            } />
            {d.trialPeriodExists && (
              <>
                <Row label="期間" value={[
                  d.trialPeriodMonths ? `${d.trialPeriodMonths}ヶ月` : null,
                  d.trialPeriodWeeks ? `${d.trialPeriodWeeks}週` : null,
                  d.trialPeriodDays ? `${d.trialPeriodDays}日` : null,
                ].filter(Boolean).join("・") || null} />
                <Row label="条件補足" value={d.trialPeriod || null} />
                <Row label="試用期間中の雇用形態" value={
                  d.trialEmploymentSame === true ? "本採用時と同じ" :
                  d.trialEmploymentSame === false ? (d.trialEmploymentType || "異なる") : null
                } />
                <Row label="試用期間中の労働時間" value={d.trialWorkingHours ? `${d.trialWorkingHours}時間/月` : null} />
                <Row label="試用期間中の給与" value={
                  d.trialSalarySame === true ? "本採用時と同じ" :
                  d.trialSalarySame === false ? [
                    d.trialSalaryType,
                    fmtYen(d.trialSalaryMin),
                    d.trialSalaryMin && d.trialSalaryMax ? "〜" : null,
                    fmtYen(d.trialSalaryMax),
                    d.trialAnnualSalary ? `想定年収: ${d.trialAnnualSalary}` : null,
                  ].filter(Boolean).join(" ") || null : null
                } />
              </>
            )}
          </JobSection>

          {/* 休日・休暇 */}
          <JobSection title="休日・休暇">
            <Row label="休日タイプ" value={d.holidayType || null} />
            <Row label="年間休日数" value={d.annualHolidayCount ? `${d.annualHolidayCount}日` : null} />
            <Row label="休日・休暇テキスト" value={d.holidayPolicy || null} />
            <Row label="休日特徴" value={d.holidayFeatures?.length ? d.holidayFeatures.join("、") : null} />
          </JobSection>

          {/* 勤務地 */}
          <JobSection title="勤務地">
            <Row label="エリア" value={d.region || null} />
            <Row label="都道府県" value={d.location || null} />
            <Row label="事業所名" value={d.officeName || null} />
            <Row label="住所詳細" value={d.officeDetail || null} />
            <Row label="アクセス" value={d.access || null} />
          </JobSection>

          {/* 仕事内容 */}
          <JobSection title="仕事内容">
            <Row label="勤務時間" value={d.workingHours || null} />
            <BodyRow label="仕事内容" value={d.description} />
            <BodyRow label="応募条件" value={d.requirements || null} />
            <BodyRow label="求む適性" value={d.desiredAptitude || null} />
            <BodyRow label="おすすめしたい方" value={d.recommendedFor || null} />
            <BodyRow label="募集背景" value={d.recruitmentBackground || null} />
            <BodyRow label="ポジションミッション" value={d.positionMission || null} />
            <Row label="入社時期" value={d.joinTiming || null} />
            <Row label="研修情報" value={d.trainingInfo || null} />
          </JobSection>

          {/* 選考情報 */}
          <JobSection title="選考情報">
            <BodyRow label="選考フロー" value={d.selectionProcess || null} />
            <Row label="面接回数・方法" value={d.interviewCount || null} />
            <Row label="選考期間" value={d.selectionDuration || null} />
          </JobSection>

          {/* 福利厚生 */}
          <JobSection title="福利厚生">
            <Row label="福利厚生" value={d.benefits?.length ? d.benefits.join("、") : null} />
          </JobSection>

          {/* 環境 */}
          <JobSection title="受動喫煙対策">
            <Row label="屋内" value={d.smokingPolicyIndoor || null} />
            <Row label="屋外" value={d.smokingPolicyOutdoor || null} />
            <Row label="特記事項" value={d.smokingNote || null} />
          </JobSection>

          {/* 青少年雇用情報 */}
          {youthStats && youthStats.length > 0 && (
            <JobSection title="青少年雇用情報">
              <div className="overflow-x-auto">
                <table className="min-w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#f0f0f0] text-[#888]">
                      <th className="pb-2 pr-4 text-left font-semibold">年度</th>
                      <th className="pb-2 pr-4 text-left font-semibold">新卒採用</th>
                      <th className="pb-2 pr-4 text-left font-semibold">新卒離職</th>
                      <th className="pb-2 pr-4 text-left font-semibold">平均年齢</th>
                      <th className="pb-2 pr-4 text-left font-semibold">残業時間</th>
                      <th className="pb-2 pr-4 text-left font-semibold">有給取得</th>
                      <th className="pb-2 pr-4 text-left font-semibold">育休取得</th>
                    </tr>
                  </thead>
                  <tbody>
                    {youthStats.map((s) => (
                      <tr key={s.year} className="border-b border-[#f8f8f8]">
                        <td className="py-1.5 pr-4">{s.year}年</td>
                        <td className="py-1.5 pr-4">{s.newGradHired || "-"}</td>
                        <td className="py-1.5 pr-4">{s.newGradLeft || "-"}</td>
                        <td className="py-1.5 pr-4">{s.avgAge || "-"}</td>
                        <td className="py-1.5 pr-4">{s.overtimeHours || "-"}</td>
                        <td className="py-1.5 pr-4">{s.paidLeaveAvg || "-"}</td>
                        <td className="py-1.5 pr-4">{s.parentalLeave || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </JobSection>
          )}
        </div>

        {/* Right: stats + review actions */}
        <div className="space-y-4">
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">応募数</p>
            <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">{job.applications.length}</p>
          </div>
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">有効請求額</p>
            <p className="mt-2 text-[28px] font-bold text-[#10b981]">¥{(totalCharges._sum.amount ?? 0).toLocaleString()}</p>
            <p className="mt-1 text-[12px] text-[#aaa]">{totalCharges._count}件</p>
          </div>
          <JobReviewActions jobId={job.id} disabledApprove={job.reviewStatus === "PUBLISHED" && !pendingContent} />
        </div>
      </div>

      {/* 応募一覧 */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">応募一覧</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">応募者</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">請求額</th>
                <th className="px-5 py-3 font-semibold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {job.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#aaa]">応募はありません</td>
                </tr>
              ) : (
                job.applications.map((application) => (
                  <tr key={application.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/jobseekers/${application.userId}`} className="hover:text-[#2f6cff] hover:underline">
                        {application.user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#2f6cff]">
                        {APPLICATION_STATUS_LABELS[application.status] || application.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      {application.charge ? `¥${application.charge.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-[#888]">{application.createdAt.toLocaleDateString("ja-JP")}</td>
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

function JobSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 border-b border-[#f0f4f8] pb-3 text-[15px] font-bold text-[#1e293b]">{title}</h2>
      <dl className="space-y-3 text-[14px]">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-4">
      <dt className="w-[140px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">{value}</dd>
    </div>
  );
}

function BodyRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-4">
      <dt className="w-[140px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="whitespace-pre-wrap leading-[1.8] text-[#333]">{value}</dd>
    </div>
  );
}
