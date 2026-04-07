import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { TopHero } from "@/components/top-hero";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  buildPublishedJobSearchWhere,
  buildTargetFilter,
  normalizeCategoryParam,
  normalizeEmploymentTypeParam,
  normalizeTextParam,
} from "@/lib/job-search";
import { graduationYearLabel } from "@/lib/graduation-years";
import Link from "next/link";

type SearchParams = Promise<{
  q?: string;
  location?: string;
  tag?: string;
  category?: string;
  employmentType?: string;
  target?: string;
  sort?: string;
  page?: string;
  experience?: string;
  salary?: string;
}>;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = await searchParams;
  const q = normalizeTextParam(search.q);
  const location = normalizeTextParam(search.location);
  const tag = normalizeTextParam(search.tag);
  const category = normalizeCategoryParam(search.category);
  const employmentType = normalizeEmploymentTypeParam(search.employmentType);
  const target = normalizeTextParam(search.target);
  const sort = normalizeTextParam(search.sort);
  const experience = normalizeTextParam(search.experience);
  const salary = normalizeTextParam(search.salary);
  const page = Math.max(1, Number.parseInt(normalizeTextParam(search.page) || "1", 10) || 1);
  const pageSize = 12;

  const where: Prisma.JobWhereInput = {
    ...buildPublishedJobSearchWhere({
      q,
      category,
      employmentType,
      location,
      target,
      experience,
      salary,
    }),
    ...(tag && { tags: { hasSome: [tag] } }),
  };

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "popular" ? { viewCount: "desc" } : { createdAt: "desc" };

  const [jobs, totalCount] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const targetFilter = buildTargetFilter(target);
  const targetLabel =
    target === "mid"
      ? "中途向け求人"
      : target && "graduationYear" in targetFilter && typeof targetFilter.graduationYear === "number"
        ? `${graduationYearLabel(targetFilter.graduationYear)}向け求人`
        : "求人一覧";

  function buildPageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (tag) params.set("tag", tag);
    if (category) params.set("category", category);
    if (employmentType) params.set("employmentType", employmentType);
    if (experience) params.set("experience", experience);
    if (salary) params.set("salary", salary);
    if (target) params.set("target", target);
    if (sort) params.set("sort", sort);
    if (nextPage > 1) params.set("page", String(nextPage));
    return params.toString() ? `/jobs?${params.toString()}` : "/jobs";
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <TopHero
        activeTab="search"
        defaultQ={q}
        defaultCategory={category}
        defaultEmploymentType={employmentType}
        defaultLocation={location}
        defaultExperience={experience}
        defaultSalary={salary}
        searchPath="/jobs"
        includeSearchTabParam={false}
        showTabs={false}
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-10 md:px-6">
        <h1 className="mb-6 text-[28px] font-bold text-[#222]">
          {sort === "popular" ? "注目の求人" : targetLabel}
        </h1>

        {(q || location || tag || category || employmentType) && (
          <p className="mt-4 text-[13px] text-[#888]">
            {totalCount} 件の求人が見つかりました
            {q && <span>（キーワード: {q}）</span>}
            {tag && <span>（タグ: {tag}）</span>}
            {category && <span>（カテゴリ: {category}）</span>}
            {location && <span>（勤務地: {location}）</span>}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.length === 0 ? (
            <p className="col-span-3 py-10 text-center text-[14px] text-[#888]">
              条件に合う求人が見つかりませんでした。
            </p>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                companyName={job.company.name}
                location={job.location}
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
                description={job.description}
                imageSrc={job.imageUrl ?? undefined}
                badge={sort === "popular" ? "注目" : "新着"}
                categoryTag={job.categoryTag ?? undefined}
                tags={job.tags.length > 0 ? job.tags : undefined}
                createdAt={job.createdAt}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href={buildPageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={`rounded-[10px] border px-4 py-2 text-[13px] font-semibold ${
                page <= 1
                  ? "pointer-events-none border-[#e5e5e5] text-[#bbb]"
                  : "border-[#d8d8d8] text-[#555] hover:bg-white"
              }`}
            >
              前へ
            </Link>
            <p className="text-[13px] text-[#666]">
              {page} / {totalPages}
            </p>
            <Link
              href={buildPageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={`rounded-[10px] border px-4 py-2 text-[13px] font-semibold ${
                page >= totalPages
                  ? "pointer-events-none border-[#e5e5e5] text-[#bbb]"
                  : "border-[#d8d8d8] text-[#555] hover:bg-white"
              }`}
            >
              次へ
            </Link>
          </div>
        )}
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
