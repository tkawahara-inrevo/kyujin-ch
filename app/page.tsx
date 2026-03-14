import { Header } from "@/components/header";
import { TopHero } from "@/components/top-hero";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { TargetSelectModal } from "@/components/target-select-modal";
import { TargetSync } from "@/components/target-sync";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getActiveGraduationYears, graduationYearLabel } from "@/lib/graduation-years";
import { auth } from "@/auth";
import Link from "next/link";

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
  target?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const [currentYear, nextYear] = getActiveGraduationYears();
  const { q, category, employmentType, location, target } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const targetFilter: any = {};
  if (target && target !== "all") {
    if (target === "mid") {
      targetFilter.targetType = "MID_CAREER";
    } else {
      const year = Number(target);
      if (!isNaN(year)) {
        targetFilter.targetType = "NEW_GRAD";
        targetFilter.graduationYear = year;
      }
    }
  }

  const where = {
    isPublished: true,
    isDeleted: false,
    ...targetFilter,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { company: { name: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
    ...(category && { categoryTag: { equals: category, mode: "insensitive" as const } }),
    ...(employmentType && { employmentType: employmentType as Prisma.EnumEmploymentTypeFilter }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const jobs = await prisma.job.findMany({
    where,
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  // 注目の求人（最初の6件）と新着求人（残り）
  const featuredJobs = jobs.slice(0, 6);
  const newJobs = jobs.slice(0, 6);

  const activeTarget = target || "all";
  const hasSearchFilter = !!(q || category || employmentType || location);

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      {!isLoggedIn && (
        <TargetSelectModal currentYear={currentYear} nextYear={nextYear} />
      )}
      <TargetSync />
      <Header />
      <TopHero
        activeTab="search"
        defaultQ={q}
        defaultCategory={category}
        defaultEmploymentType={employmentType}
        defaultLocation={location}
      />

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-10">
          <div>
            {hasSearchFilter ? (
              /* 検索結果モード */
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[20px] font-bold text-[#222] md:text-[22px]">
                    {activeTarget === "all"
                      ? "検索結果"
                      : activeTarget === "mid"
                        ? "中途向け求人"
                        : `${graduationYearLabel(Number(activeTarget))}向け求人`}
                  </h2>
                  <p className="text-[13px] text-[#888]">
                    {jobs.length} 件
                    {q && <span>（{q}）</span>}
                    {category && <span>（{category}）</span>}
                  </p>
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
                        badge={
                          job.targetType === "NEW_GRAD" && job.graduationYear
                            ? graduationYearLabel(job.graduationYear)
                            : "中途"
                        }
                        categoryTag={job.categoryTag ?? undefined}
                        tags={job.tags.length > 0 ? job.tags : undefined}
                        createdAt={job.createdAt}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              /* トップページモード: 注目 + 新着 */
              <>
                {/* 注目の求人 */}
                <section>
                  <h2 className="mb-5 text-[20px] font-bold text-[#222] md:text-[22px]">注目の求人</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredJobs.map((job, index) => (
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
                        badge="注目"
                        categoryTag={job.categoryTag ?? undefined}
                        tags={job.tags.length > 0 ? job.tags : undefined}
                        createdAt={job.createdAt}
                      />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/jobs"
                      className="inline-block rounded-full bg-[#2f6cff] px-10 py-3.5 text-[14px] font-bold !text-white shadow-sm transition hover:bg-[#2558d4]"
                    >
                      注目の求人をもっと見る
                    </Link>
                  </div>
                </section>

                {/* 区切り線 */}
                <hr className="my-10 border-[#e5e5e5]" />

                {/* 新着求人 */}
                <section>
                  <h2 className="mb-5 text-[20px] font-bold text-[#222] md:text-[22px]">新着求人</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {newJobs.map((job, index) => (
                      <JobCard
                        key={`new-${job.id}`}
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
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/jobs"
                      className="inline-block rounded-full bg-[#2f6cff] px-10 py-3.5 text-[14px] font-bold !text-white shadow-sm transition hover:bg-[#2558d4]"
                    >
                      新着の求人をもっと見る
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />

      {/* モバイル固定バー（ログイン済み: ナビ / 未ログイン: 認証バー） */}
      <MobileBottomBar />
    </main>
  );
}
