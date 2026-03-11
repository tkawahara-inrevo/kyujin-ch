import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { JobSearchBar } from "@/components/job-search-bar";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

type SearchParams = Promise<{ q?: string; location?: string; tag?: string; category?: string; employmentType?: string }>;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, location, tag, category, employmentType } = await searchParams;

  const where: Prisma.JobWhereInput = {
    isPublished: true,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
        { categoryTag: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(tag && { tags: { hasSome: [tag] } }),
    ...(category && { categoryTag: { contains: category, mode: "insensitive" } }),
    ...(employmentType && { employmentType: employmentType as Prisma.EnumEmploymentTypeFilter }),
    ...(location && {
      location: { contains: location, mode: "insensitive" },
    }),
  };

  const jobs = await prisma.job.findMany({
    where,
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <h1 className="mb-6 text-[28px] font-bold text-[#222]">求人一覧</h1>

        <JobSearchBar defaultQ={q} defaultLocation={location} />

        {(q || location || tag || category || employmentType) && (
          <p className="mt-4 text-[13px] text-[#888]">
            {jobs.length} 件の求人が見つかりました
            {q && <span>（キーワード：{q}）</span>}
            {tag && <span>（タグ：{tag}）</span>}
            {category && <span>（カテゴリ：{category}）</span>}
            {location && <span>（勤務地：{location}）</span>}
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
                badge="新着"
                categoryTag={job.categoryTag ?? undefined}
                tags={job.tags.length > 0 ? job.tags : undefined}
                createdAt={job.createdAt}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
