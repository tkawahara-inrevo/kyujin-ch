import type React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { CompanySummaryCard } from "@/components/company-summary-card";
import { RecommendSection } from "@/components/recommend-section";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { JobViewTracker } from "@/components/job-view-tracker";
import { ApplyButton } from "@/components/apply-button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { graduationYearLabel } from "@/lib/graduation-years";
import { EMPLOYMENT_LABELS, OTHER_CATEGORY_VALUE } from "@/lib/job-options";
import { rankRecommendedJobs } from "@/lib/recommended-jobs";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EMPLOYMENT_PERIOD_LABELS: Record<string, string> = {
  indefinite: "期間の定めなし",
  fixed: "有期雇用",
  trial: "試用期間あり",
};

function formatTarget(job: {
  targetType: string;
  graduationYear: number | null;
}) {
  if (job.targetType === "NEW_GRAD" && job.graduationYear) {
    return graduationYearLabel(job.graduationYear);
  }
  return "中途";
}

function formatEmployment(job: {
  employmentType: string;
  employmentTypeDetail: string | null;
}) {
  if (job.employmentType === "OTHER" && job.employmentTypeDetail) {
    return `${EMPLOYMENT_LABELS.OTHER} (${job.employmentTypeDetail})`;
  }
  return EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType;
}

function formatCategory(job: {
  categoryTag: string | null;
  categoryTagDetail: string | null;
}) {
  if (job.categoryTag === OTHER_CATEGORY_VALUE && job.categoryTagDetail) {
    return `${OTHER_CATEGORY_VALUE} (${job.categoryTagDetail})`;
  }
  return job.categoryTag ?? null;
}

const SALARY_TYPE_LABELS: Record<string, string> = {
  annual: "年俸", monthly: "月給", daily: "日給", hourly: "時給",
};

function formatSalaryRange(type: string | null, min?: number | null, max?: number | null) {
  const label = type ? (SALARY_TYPE_LABELS[type] ?? "") : "";
  const fmt = (n: number) => `${n.toLocaleString()}円`;
  if (!min && !max) return null;
  if (min && max) return `${label} ${fmt(min)}〜${fmt(max)}`;
  if (min) return `${label} ${fmt(min)}〜`;
  return `${label} 〜${fmt(max!)}`;
}

function formatDate(date?: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("ja-JP");
}

function buildMapQuery(location?: string | null, officeDetail?: string | null) {
  const base = location?.trim() ?? "";
  const detail = officeDetail?.trim() ?? "";

  if (!base) return detail;
  if (!detail) return base;
  if (detail.startsWith(base)) return detail;

  return `${base} ${detail}`;
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

export default async function JobDetailPage({
  params,
}: JobDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!job) {
    notFound();
  }

  if (!job.isPublished || job.reviewStatus !== "PUBLISHED" || job.isDeleted) {
    notFound();
  }

  const hasApplied = isLoggedIn
    ? !!(await prisma.application.findUnique({
        where: { userId_jobId: { userId: session!.user!.id!, jobId: job.id } },
      }))
    : false;

  const [companyJobsCount, companyReviewsCount] = await Promise.all([
    prisma.job.count({
      where: { companyId: job.companyId, isPublished: true, reviewStatus: "PUBLISHED", isDeleted: false },
    }),
    prisma.review.count({ where: { companyId: job.companyId } }),
  ]);

  const recommendationCandidates = await prisma.job.findMany({
    where: {
      NOT: { id: job.id },
      isPublished: true,
      reviewStatus: "PUBLISHED",
      isDeleted: false,
    },
    include: {
      company: true,
    },
    take: 24,
    orderBy: {
      createdAt: "desc",
    },
  });

  const recommendedJobs = rankRecommendedJobs(job, recommendationCandidates, 3);

  const categoryLabel = formatCategory(job);
  const employmentLabel = formatEmployment(job);
  const salaryRange = formatSalaryRange(
    (job as { salaryType?: string | null }).salaryType ?? null,
    job.salaryMin,
    job.salaryMax,
  );
  const workLocation = formatWorkLocation(job.location, job.officeDetail);
  const mapQuery = buildMapQuery(job.location, job.officeDetail);

  // 新フィールド（型キャスト）
  const j = job as typeof job & {
    salaryType?: string | null;
    monthlySalary?: string | null;
    salaryRevision?: string | null;
    bonus?: string | null;
    hasFixedOvertime?: boolean | null;
    fixedOvertime?: string | null;
    trialPeriodExists?: boolean | null;
    trialPeriodMonths?: number | null;
    trialSalaryType?: string | null;
    trialSalaryMin?: number | null;
    trialSalaryMax?: number | null;
    trialAnnualSalary?: string | null;
    trialPeriod?: string | null;
    holidayType?: string | null;
    holidayFeatures?: string[];
    annualHolidayCount?: number | null;
    holidayPolicy?: string | null;
    recruitmentBackground?: string | null;
  };
  const trialSalaryRange = formatSalaryRange(j.trialSalaryType ?? null, j.trialSalaryMin, j.trialSalaryMax);

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <JobViewTracker jobId={job.id} />
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_252px] lg:gap-8">
          <div>
            {/* ── トップカード ── */}
            <div className="rounded-[20px] border border-[#e8ebf0] bg-white p-5 md:p-7">
              {/* 会社名 + ブックマーク */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-[#6b7280]">
                  {job.company.name}
                </p>
                <FavoriteToggleButton
                  jobId={job.id}
                  revalidatePaths={[`/jobs/${job.id}`, "/favorites"]}
                />
              </div>

              {/* タイトル */}
              <h1 className="mt-2 text-[20px] font-bold leading-[1.5] text-[#1f2937] md:text-[28px]">
                {job.title}
              </h1>

              {/* 画像 */}
              <div className="relative mt-5 aspect-[2.4/1] overflow-hidden rounded-[14px] bg-[#ececec] md:aspect-[2.15/1]">
                <Image
                  src={job.imageUrl || "/assets/Resume.png"}
                  alt={job.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>

              {/* 勤務地 + 年収 */}
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

              {/* タグ */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#2f6cff] px-3 py-1 text-[11px] font-bold text-white">
                  {formatTarget(job)}
                </span>
                {categoryLabel && (
                  <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[11px] font-bold text-white">
                    {categoryLabel}
                  </span>
                )}
                <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-bold text-[#2f6cff]">
                  {employmentLabel}
                </span>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-bold text-[#5b6472]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── テキストセクション ── */}
            <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#f0f0f0]">
              {/* 概要 */}
              <div>
                <SectionHeader title="概要" />
                <dl className="px-5">
                  <InfoRow label="仕事内容" value={job.description} />
                  <InfoRow label="応募条件" value={job.requirements} />
                  <InfoRow label="求める人物像" value={job.desiredAptitude} />
                </dl>
              </div>

              {/* 募集要項（基本情報） */}
              <div>
                <SectionHeader title="募集要項" />
                <dl className="px-5">
                  <InfoRow label="雇用形態" value={employmentLabel} />
                  <InfoRow label="対象" value={formatTarget(job)} />
                  <InfoRow label="カテゴリ" value={categoryLabel} />
                  <InfoRow label="職種" value={job.jobSubcategory} />
                  <InfoRow label="勤務地" value={workLocation} />
                  <InfoRow label="最寄・アクセス" value={job.access} />
                </dl>
              </div>

              {/* 雇用情報（給与） */}
              <div>
                <SectionHeader title="雇用情報" />
                <dl className="px-5">
                  <InfoRow label="給与" value={salaryRange} />
                  {j.monthlySalary && <InfoRow label="想定年収" value={j.monthlySalary} />}
                  {j.salaryType !== "annual" && <InfoRow label="賞与" value={j.bonus} />}
                  {j.hasFixedOvertime != null && (
                    <InfoRow label="みなし残業">
                      <span>{j.hasFixedOvertime ? "あり" : "なし"}</span>
                      {j.hasFixedOvertime && j.fixedOvertime && (
                        <p className="mt-1 text-[12px] text-[#666]">{j.fixedOvertime}</p>
                      )}
                    </InfoRow>
                  )}
                </dl>
              </div>

              {/* 試用期間 */}
              {j.trialPeriodExists != null && (
                <div>
                  <SectionHeader title="試用期間" />
                  <dl className="px-5">
                    <InfoRow label="試用期間">
                      {j.trialPeriodExists
                        ? `あり（${j.trialPeriodMonths ?? ""}ヶ月）`
                        : "なし"}
                    </InfoRow>
                    {j.trialPeriodExists && (
                      <>
                        {(trialSalaryRange || j.trialAnnualSalary) && (
                          <InfoRow label="試用中の給与" value={j.trialAnnualSalary || trialSalaryRange} />
                        )}
                        {j.trialPeriod && (
                          <InfoRow label="変更となる条件" value={j.trialPeriod} />
                        )}
                      </>
                    )}
                  </dl>
                </div>
              )}

              {/* 休日休暇 */}
              {(j.holidayType || j.holidayPolicy) && (
                <div>
                  <SectionHeader title="休日休暇" />
                  <dl className="px-5">
                    <InfoRow label="休みの取り方" value={j.holidayType} />
                    <InfoRow label="詳細" value={j.holidayPolicy} />
                  </dl>
                </div>
              )}

              {/* 福利厚生 */}
              <div>
                <SectionHeader title="福利厚生" />
                <div className="px-6 py-4">
                  {job.benefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit) => (
                        <span key={benefit} className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[12px] font-semibold text-[#475569]">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#94a3b8]">現在確認中です。</p>
                  )}
                </div>
              </div>

              {/* 選考情報 */}
              <div>
                <SectionHeader title="選考情報" />
                {job.selectionProcess && (
                  <div className="border-t border-[#f0f0f0] px-6 py-4">
                    <p className="text-[12px] font-semibold text-[#888]">選考フロー</p>
                    <div className="mt-2 whitespace-pre-line text-[13px] leading-[1.9] text-[#333]">
                      {job.selectionProcess}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 地図 */}
            {mapQuery && (
              <div className="mt-5 rounded-[18px] border border-[#e5e5e5] bg-white p-6">
                <h3 className="text-[16px] font-bold text-[#1a1a1a]">勤務地マップ</h3>
                {workLocation && (
                  <p className="mt-2 text-[13px] text-[#555]">{workLocation}</p>
                )}
                <div className="mt-4 overflow-hidden rounded-xl">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&hl=ja`}
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="勤務地マップ"
                  />
                </div>
              </div>
            )}

            {/* 企業情報 */}
            <div className="mt-5">
              <CompanySummaryCard
                companyId={job.company.id}
                companyName={job.company.name}
                location={job.company.location}
                description={job.company.description}
                websiteUrl={
                  (job.company as { websiteUrl?: string | null }).websiteUrl ?? null
                }
                jobsCount={companyJobsCount}
                reviewsCount={companyReviewsCount}
              />
            </div>

            {/* 応募ボタン（本文下） */}
            <div className="mt-6">
              <ApplyButton
                href={`/jobs/${job.id}/apply`}
                isLoggedIn={isLoggedIn}
                hasApplied={hasApplied}
                label="応募する"
                className="block rounded-[12px] bg-[#2f6cff] px-6 py-4 text-center text-[15px] font-bold !text-white transition hover:opacity-90"
              />
            </div>

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar
            applyHref={`/jobs/${job.id}/apply`}
            primaryLabel="今すぐ応募する"
            isLoggedIn={isLoggedIn}
            hasApplied={hasApplied}
          />
        </div>
      </div>

      {/* モバイル固定応募バー */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e9e9e9] bg-white px-4 py-3 lg:hidden">
        <ApplyButton
          href={`/jobs/${job.id}/apply`}
          isLoggedIn={isLoggedIn}
          hasApplied={hasApplied}
          label="今すぐ応募する"
          className="block w-full rounded-[10px] bg-[#2f6cff] py-3.5 text-center text-[15px] font-bold !text-white transition hover:opacity-90"
        />
      </div>

      <div className="h-[72px] lg:hidden" />

      <Footer />
    </main>
  );
}
