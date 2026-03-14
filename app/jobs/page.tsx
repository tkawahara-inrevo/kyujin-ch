import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { JobSearchBar } from "@/components/job-search-bar";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  buildPublishedJobSearchWhere,
  normalizeCategoryParam,
  normalizeEmploymentTypeParam,
  normalizeTextParam,
} from "@/lib/job-search";

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

type SearchParams = Promise<{
  q?: string;
  location?: string;
  tag?: string;
  category?: string;
  employmentType?: string;
  target?: string;
  sort?: string;
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

  const where: Prisma.JobWhereInput = {
    ...buildPublishedJobSearchWhere({
      q,
      category,
      employmentType,
      location,
      target,
    }),
    ...(tag && { tags: { hasSome: [tag] } }),
  };

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "popular" ? { viewCount: "desc" } : { createdAt: "desc" };

  const [jobs, categoryTags] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true },
      orderBy,
    }),
    prisma.job.findMany({
      where: { isPublished: true, isDeleted: false, categoryTag: { not: null } },
      select: { categoryTag: true },
      distinct: ["categoryTag"],
    }),
  ]);

  const categories = categoryTags
    .map((job) => job.categoryTag!)
    .filter(Boolean)
    .sort();

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <h1 className="mb-6 text-[28px] font-bold text-[#222]">
          {sort === "popular" ? "注目の求人" : "求人一覧"}
        </h1>

        <JobSearchBar
          defaultQ={q}
          defaultLocation={location}
          defaultCategory={category}
          defaultEmploymentType={employmentType}
          defaultTarget={target}
          defaultSort={sort}
          categories={categories}
        />

        {(q || location || tag || category || employmentType) && (
          <p className="mt-4 text-[13px] text-[#888]">
            {jobs.length} 件の求人が見つかりました
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
            jobs.map((job, index) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                companyName={job.company.name}
                location={job.location}
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
                description={job.description}
                imageSrc={cardImages[index % cardImages.length]}
                badge={sort === "popular" ? "注目" : "新着"}
                categoryTag={job.categoryTag ?? undefined}
                tags={job.tags.length > 0 ? job.tags : undefined}
                createdAt={job.createdAt}
              />
            ))
          )}
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
