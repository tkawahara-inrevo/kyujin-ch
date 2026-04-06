import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { JOB_REVIEW_STATUS_BADGE_CLASSES, JOB_REVIEW_STATUS_LABELS } from "@/lib/job-review";
import { EMPLOYMENT_LABELS, OTHER_CATEGORY_VALUE } from "@/lib/job-options";
import { graduationYearLabel } from "@/lib/graduation-years";
import { prisma } from "@/lib/prisma";
import { JobReviewActions } from "./job-review-actions";
import type { YouthYearStats } from "@/app/actions/company/jobs";

const SALARY_TYPE_LABELS: Record<string, string> = {
  annual: "年俸", monthly: "月給", daily: "日給", hourly: "時給",
};

function formatSalaryRange(type: string | null | undefined, min?: number | null, max?: number | null) {
  const label = type ? (SALARY_TYPE_LABELS[type] ?? "") : "";
  const fmt = (n: number) => `${n.toLocaleString()}円`;
  if (!min && !max) return null;
  if (min && max) return `${label} ${fmt(min)}〜${fmt(max)}`;
  if (min) return `${label} ${fmt(min)}〜`;
  return `${label} 〜${fmt(max!)}`;
}

function formatTarget(targetType: string, graduationYear: number | null) {
  if (targetType === "NEW_GRAD" && graduationYear) return graduationYearLabel(graduationYear);
  return "中途";
}

function formatWorkLocation(location?: string | null, officeDetail?: string | null) {
  const base = location?.trim() ?? "";
  const detail = officeDetail?.trim() ?? "";
  if (!base) return detail || null;
  if (!detail) return base;
  if (detail.startsWith(base)) return detail;
  return `${base} ${detail}`;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-[#2f6cff] px-5 py-1.5">
      <h2 className="text-[13px] font-bold text-white">{title}</h2>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div className="flex gap-5 border-b border-[#f0f0f0] py-4 last:border-0">
      <dt className="w-[96px] shrink-0 text-[12px] font-semibold text-[#6b7280]">{label}</dt>
      <dd className="flex-1 whitespace-pre-line text-[13px] leading-[1.9] text-[#333]">
        {children ?? value}
      </dd>
    </div>
  );
}

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
      applications: { select: { id: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!job) notFound();

  const pendingContent = job.reviewStatus === "PENDING_REVIEW"
    ? parsePendingContent(job.pendingContent)
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = pendingContent
    ? {
        ...job,
        ...pendingContent,
        closingDate: pendingContent.closingDate ? new Date(pendingContent.closingDate) : job.closingDate,
        youthEmploymentStats: Array.isArray(pendingContent.youthEmploymentStats)
          ? pendingContent.youthEmploymentStats
          : (Array.isArray(job.youthEmploymentStats) ? job.youthEmploymentStats : null),
      }
    : {
        ...job,
        youthEmploymentStats: Array.isArray(job.youthEmploymentStats) ? job.youthEmploymentStats : null,
      };

  const categoryLabel =
    d.categoryTag === OTHER_CATEGORY_VALUE && d.categoryTagDetail
      ? d.categoryTagDetail
      : (d.categoryTag || null);

  const employmentLabel =
    d.employmentType === "OTHER" && d.employmentTypeDetail
      ? `${EMPLOYMENT_LABELS.OTHER} (${d.employmentTypeDetail})`
      : (EMPLOYMENT_LABELS[d.employmentType] ?? d.employmentType);

  const salaryRange = formatSalaryRange(d.salaryType, d.salaryMin, d.salaryMax);
  const trialSalaryRange = formatSalaryRange(d.trialSalaryType, d.trialSalaryMin, d.trialSalaryMax);
  const workLocation = formatWorkLocation(d.location, d.officeDetail);
  const targetLabel = formatTarget(d.targetType ?? "MID_CAREER", d.graduationYear ?? null);

  const youthStats: YouthYearStats[] | null = Array.isArray(d.youthEmploymentStats) ? d.youthEmploymentStats : null;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Admin top bar */}
      <div className="bg-white px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center gap-2 text-[13px] text-[#888]">
            <Link href="/admin/jobs" className="hover:text-[#2f6cff]">求人一覧</Link>
            <span>/</span>
            <Link href={`/admin/companies/${job.companyId}`} className="hover:text-[#2f6cff]">{job.company.name}</Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
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
            <span className="ml-auto text-[12px] text-[#aaa]">
              PV: {job.viewCount} ／ 応募: {job.applications.length} ／ 投稿: {job.createdAt.toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>

      {/* Job content — same structure as public page */}
      <div className="mx-auto max-w-[900px] px-4 py-6 md:px-6 md:py-10">
        {/* Top card */}
        <div className="rounded-[20px] border border-[#e8ebf0] bg-white p-5 md:p-7">
          <p className="text-[13px] font-semibold text-[#6b7280]">{job.company.name}</p>

          <h1 className="mt-2 text-[20px] font-bold leading-[1.5] text-[#1f2937] md:text-[28px]">
            {d.title}
          </h1>

          <div className="relative mt-5 aspect-[2.4/1] overflow-hidden rounded-[14px] bg-[#ececec] md:aspect-[2.15/1]">
            <Image
              src={d.imageUrl || "/assets/Resume.png"}
              alt={d.title}
              fill
              className="object-cover"
              sizes="900px"
            />
          </div>

          {(workLocation || salaryRange) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {workLocation && (
                <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                  <Image src="/assets/Map_Pin.png" alt="" width={14} height={14} className="shrink-0" />
                  <span>{workLocation}</span>
                </div>
              )}
              {salaryRange && (
                <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                  <Image src="/assets/Paper.png" alt="" width={14} height={14} className="shrink-0" />
                  <span>{salaryRange}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#2f6cff] px-3 py-1 text-[11px] font-bold text-white">
              {targetLabel}
            </span>
            {categoryLabel && (
              <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[11px] font-bold text-white">
                {categoryLabel}
              </span>
            )}
            <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-bold text-[#2f6cff]">
              {employmentLabel}
            </span>
            {(d.tags ?? []).map((tag: string) => (
              <span key={tag} className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-bold text-[#5b6472]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#f0f0f0]">
          {/* 求人メモ（社内管理用） */}
          {job.note && (
            <div>
              <SectionHeader title="求人メモ（社内管理用）" />
              <div className="px-5 py-4">
                <p className="whitespace-pre-line text-[13px] text-[#444]">{job.note}</p>
              </div>
            </div>
          )}

          {/* 概要 */}
          <div>
            <SectionHeader title="概要" />
            <dl className="px-5">
              <InfoRow label="仕事内容" value={d.description} />
              <InfoRow label="応募条件" value={d.requirements} />
              <InfoRow label="求める人物像" value={d.desiredAptitude} />
              <InfoRow label="おすすめの方" value={d.recommendedFor} />
              <InfoRow label="ポジション役割" value={d.positionMission} />
            </dl>
          </div>

          {/* 募集要項 */}
          <div>
            <SectionHeader title="募集要項" />
            <dl className="px-5">
              <InfoRow label="雇用形態" value={employmentLabel} />
              <InfoRow label="雇用期間" value={d.employmentPeriodType} />
              <InfoRow label="対象" value={targetLabel} />
              <InfoRow label="カテゴリ" value={categoryLabel} />
              <InfoRow label="勤務地" value={workLocation} />
              <InfoRow label="最寄・アクセス" value={d.access} />
              <InfoRow label="勤務時間" value={d.workingHours} />
              <InfoRow label="研修情報" value={d.trainingInfo} />
              <InfoRow label="掲載終了日" value={d.closingDate ? new Date(d.closingDate).toLocaleDateString("ja-JP") : null} />
            </dl>
          </div>

          {/* 雇用情報（給与） */}
          <div>
            <SectionHeader title="雇用情報" />
            <dl className="px-5">
              <InfoRow label="給与" value={salaryRange} />
              {d.monthlySalary && <InfoRow label="想定年収" value={d.monthlySalary} />}
              {d.salaryType === "annual" && d.annualPaymentMethod && (
                <InfoRow label="支払方法" value={d.annualPaymentMethod === "monthly" ? "年俸の1/12を毎月支給" : "そのほか"} />
              )}
              {d.annualPaymentNote && <InfoRow label="支払方法補足" value={d.annualPaymentNote} />}
              <InfoRow label="昇給" value={d.salaryRevision} />
              {d.salaryType !== "annual" && <InfoRow label="賞与" value={d.bonus} />}
              {d.hasFixedOvertime != null && (
                <InfoRow label="みなし残業">
                  <span>{d.hasFixedOvertime ? "あり" : "なし"}</span>
                  {d.hasFixedOvertime && d.fixedOvertime && (
                    <p className="mt-1 text-[12px] text-[#666]">{d.fixedOvertime}</p>
                  )}
                </InfoRow>
              )}
            </dl>
          </div>

          {/* 試用期間 */}
          {d.trialPeriodExists != null && (
            <div>
              <SectionHeader title="試用期間" />
              <dl className="px-5">
                <InfoRow label="試用期間">
                  {d.trialPeriodExists
                    ? [
                        "あり",
                        d.trialPeriodMonths ? `${d.trialPeriodMonths}ヶ月` : null,
                        d.trialPeriodWeeks ? `${d.trialPeriodWeeks}週` : null,
                        d.trialPeriodDays ? `${d.trialPeriodDays}日` : null,
                      ].filter(Boolean).join("・")
                    : "なし"}
                </InfoRow>
                {d.trialPeriodExists && (
                  <>
                    <InfoRow label="雇用形態" value={
                      d.trialEmploymentSame === true ? "本採用時と同じ" :
                      d.trialEmploymentSame === false ? (d.trialEmploymentType || "異なる") : null
                    } />
                    <InfoRow label="労働時間" value={d.trialWorkingHours ? `${d.trialWorkingHours}時間/月` : null} />
                    <InfoRow label="給与" value={
                      d.trialSalarySame === true ? "本採用時と同じ" :
                      d.trialSalarySame === false ? (d.trialAnnualSalary || trialSalaryRange) : null
                    } />
                    {d.trialPeriod && <InfoRow label="変更となる条件" value={d.trialPeriod} />}
                  </>
                )}
              </dl>
            </div>
          )}

          {/* 休日休暇 */}
          {(d.holidayType || d.holidayPolicy || (d.holidayFeatures && d.holidayFeatures.length > 0)) && (
            <div>
              <SectionHeader title="休日休暇" />
              <dl className="px-5">
                <InfoRow label="休みの取り方" value={d.holidayType} />
                {d.annualHolidayCount && <InfoRow label="年間休日" value={`${d.annualHolidayCount}日`} />}
                {d.holidayFeatures && d.holidayFeatures.length > 0 && (
                  <InfoRow label="特徴">
                    <div className="flex flex-wrap gap-1.5">
                      {d.holidayFeatures.map((f: string) => (
                        <span key={f} className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[12px] text-[#2f6cff]">{f}</span>
                      ))}
                    </div>
                  </InfoRow>
                )}
                <InfoRow label="詳細" value={d.holidayPolicy} />
              </dl>
            </div>
          )}

          {/* 福利厚生 */}
          <div>
            <SectionHeader title="福利厚生" />
            <div className="px-6 py-4">
              {(d.benefits ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(d.benefits as string[]).map((benefit) => (
                    <span key={benefit} className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[12px] font-semibold text-[#475569]">
                      {benefit}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#94a3b8]">未設定</p>
              )}
              {d.benefitNote && (
                <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.9] text-[#555]">{String(d.benefitNote)}</p>
              )}
            </div>
          </div>

          {/* 選考情報 */}
          <div>
            <SectionHeader title="選考情報" />
            <dl className="px-5">
              <InfoRow label="募集背景" value={d.recruitmentBackground} />
              <InfoRow label="入社時期" value={d.joinTiming} />
              <InfoRow label="面接回数" value={d.interviewCount} />
              <InfoRow label="選考期間" value={d.selectionDuration} />
            </dl>
            {d.selectionProcess && (
              <div className="border-t border-[#f0f0f0] px-6 py-4">
                <p className="text-[12px] font-semibold text-[#888]">選考フロー</p>
                <div className="mt-2 whitespace-pre-line text-[13px] leading-[1.9] text-[#333]">
                  {d.selectionProcess}
                </div>
              </div>
            )}
          </div>

          {/* 受動喫煙 */}
          {(d.smokingPolicyIndoor || d.smokingPolicyOutdoor || d.smokingNote) && (
            <div>
              <SectionHeader title="受動喫煙対策" />
              <dl className="px-5">
                <InfoRow label="屋内" value={d.smokingPolicyIndoor} />
                <InfoRow label="屋外" value={d.smokingPolicyOutdoor} />
                <InfoRow label="特記事項" value={d.smokingNote} />
              </dl>
            </div>
          )}

          {/* 青少年雇用情報 */}
          {youthStats && youthStats.length > 0 && (
            <div>
              <SectionHeader title="青少年雇用情報" />
              <div className="overflow-x-auto px-5 py-4">
                <table className="min-w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[#f0f0f0] text-[#888]">
                      {["年度", "新卒採用", "新卒離職", "平均年齢", "残業時間", "有給取得", "育休取得"].map((h) => (
                        <th key={h} className="pb-2 pr-5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {youthStats.map((s) => (
                      <tr key={s.year} className="border-b border-[#f8f8f8]">
                        <td className="py-2 pr-5">{s.year}年</td>
                        <td className="py-2 pr-5">{s.newGradHired || "-"}</td>
                        <td className="py-2 pr-5">{s.newGradLeft || "-"}</td>
                        <td className="py-2 pr-5">{s.avgAge || "-"}</td>
                        <td className="py-2 pr-5">{s.overtimeHours || "-"}</td>
                        <td className="py-2 pr-5">{s.paidLeaveAvg || "-"}</td>
                        <td className="py-2 pr-5">{s.parentalLeave || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Review actions */}
        <div className="mt-8 rounded-[16px] border border-[#dbe4ff] bg-white p-6 shadow-[0_2px_12px_rgba(47,108,255,0.08)]">
          <h2 className="text-[15px] font-bold text-[#1e293b]">審査アクション</h2>
          <p className="mt-1 text-[13px] text-[#888]">差し戻す場合は理由を入力してから「差し戻し」ボタンを押してください。</p>
          <JobReviewActions
            jobId={job.id}
            disabledApprove={job.reviewStatus === "PUBLISHED" && !pendingContent}
          />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
