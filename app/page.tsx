import { Header } from "@/components/header";
import { TopHero } from "@/components/top-hero";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const cardImages = [
  "/assets/Online.png",
  "/assets/Talk_01.png",
  "/assets/Resume.png",
  "/assets/Paper.png",
];

type SearchParams = Promise<{
  q?: string;
  category?: string;
  employmentType?: string;
  location?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, employmentType, location } = await searchParams;

  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { company: { name: { contains: q, mode: "insensitive" } } },
        ],
      }),
      ...(category && { categoryTag: { contains: category, mode: "insensitive" } }),
      ...(employmentType && { employmentType: employmentType as Prisma.EnumEmploymentTypeFilter }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
    },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <TopHero
        activeTab="search"
        defaultQ={q}
        defaultCategory={category}
        defaultEmploymentType={employmentType}
        defaultLocation={location}
      />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-[22px] font-bold text-[#222]">求人一覧</h1>
              {(q || category || employmentType || location) && (
                <p className="text-[13px] text-[#888]">
                  {jobs.length} 件
                  {q && <span>（{q}）</span>}
                  {category && <span>（{category}）</span>}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
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
          <RightSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}
