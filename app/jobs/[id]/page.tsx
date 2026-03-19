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

function formatSalaryRange(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  if (min && max) return `年収 ${min}万〜${max}万円`;
  if (min) return `年収 ${min}万円〜`;
  return `年収 〜${max}万円`;
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

function SectionBlock({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}) {
  if (!body) return null;

  return (
    <section className="rounded-[18px] border border-[#e5e5e5] bg-white p-6">
      <h2 className="text-[18px] font-bold text-[#1e3a5f]">{title}</h2>
      <div className="mt-4 whitespace-pre-line text-[14px] leading-[1.9] text-[#4b4b4b]">
        {body}
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="rounded-[14px] bg-[#f8fafc] px-4 py-4">
      <p className="text-[11px] font-semibold text-[#7a8699]">{label}</p>
      <p className="mt-1 whitespace-pre-line text-[14px] leading-[1.7] text-[#334155]">
        {value}
      </p>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <p className="text-[14px] leading-[1.8] text-[#94a3b8]">{text}</p>;
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
  const salaryRange = formatSalaryRange(job.salaryMin, job.salaryMax);
  const closingDateLabel = formatDate(job.closingDate);
  const workLocation = formatWorkLocation(job.location, job.officeDetail);
  const mapQuery = buildMapQuery(job.location, job.officeDetail);
  const employmentPeriodLabel = job.employmentPeriodType
    ? EMPLOYMENT_PERIOD_LABELS[job.employmentPeriodType] ?? job.employmentPeriodType
    : null;

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <JobViewTracker jobId={job.id} />
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <div className="rounded-[24px] border border-[#e8ebf0] bg-white p-5 md:p-7">
              <div className="flex flex-wrap gap-2">
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

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold text-[#6b7280]">
                    {job.company.name}
                  </p>
                  <h1 className="mt-2 text-[24px] font-bold leading-[1.5] text-[#1f2937] md:text-[38px]">
                    {job.title}
                  </h1>
                </div>

                <FavoriteToggleButton
                  jobId={job.id}
                  revalidatePaths={[`/jobs/${job.id}`, "/favorites"]}
                />
              </div>

              <div className="relative mt-6 aspect-[2.4/1] overflow-hidden rounded-[18px] bg-[#ececec] md:aspect-[2.15/1]">
                <Image
                  src={job.imageUrl || "/assets/Resume.png"}
                  alt={job.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <SectionBlock title="仕事内容" body={job.description} />
              <SectionBlock title="応募条件" body={job.requirements} />
              <SectionBlock title="こんな方に向いています" body={job.desiredAptitude} />
              <SectionBlock title="こんな方におすすめ" body={job.recommendedFor} />

              <section className="rounded-[18px] border border-[#e5e5e5] bg-white p-6">
                <h2 className="text-[18px] font-bold text-[#1e3a5f]">募集要項</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoItem label="雇用形態" value={employmentLabel} />
                  <InfoItem label="対象" value={formatTarget(job)} />
                  <InfoItem label="カテゴリ" value={categoryLabel} />
                  <InfoItem label="想定年収レンジ" value={salaryRange} />
                  <InfoItem label="月給" value={job.monthlySalary} />
                  <InfoItem label="年収" value={job.annualSalary} />
                  <InfoItem label="勤務地エリア" value={job.region} />
                  <InfoItem label="勤務地" value={workLocation} />
                  <InfoItem label="最寄り・アクセス" value={job.access} />
                  <InfoItem label="勤務時間" value={job.workingHours} />
                  <InfoItem label="雇用期間" value={employmentPeriodLabel} />
                  <InfoItem label="応募締切" value={closingDateLabel} />
                </div>
              </section>

              <section className="rounded-[18px] border border-[#e5e5e5] bg-white p-6">
                <h2 className="text-[18px] font-bold text-[#1e3a5f]">福利厚生・制度</h2>
                <div className="mt-4">
                  {job.benefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[12px] font-semibold text-[#475569]"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyMessage text="福利厚生・制度は現在確認中です。" />
                  )}
                </div>
              </section>

              <section className="rounded-[18px] border border-[#e5e5e5] bg-white p-6">
                <h2 className="text-[18px] font-bold text-[#1e3a5f]">選考フロー</h2>
                <div className="mt-4 whitespace-pre-line text-[14px] leading-[1.9] text-[#4b4b4b]">
                  {job.selectionProcess ? (
                    job.selectionProcess
                  ) : (
                    <EmptyMessage text="選考フローは現在確認中です。" />
                  )}
                </div>
              </section>
            </div>

            {mapQuery && (
              <div className="mt-8 rounded-[18px] border border-[#e5e5e5] bg-white p-6">
                <h3 className="text-[18px] font-bold text-[#1e3a5f]">勤務地マップ</h3>
                <p className="mt-3 text-[14px] text-[#555]">{workLocation}</p>
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

            <div className="mt-12">
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
