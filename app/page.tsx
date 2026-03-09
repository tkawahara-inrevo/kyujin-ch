import { Header } from "@/components/header";
import { TopHero } from "@/components/top-hero";
import { CategoryStrip } from "@/components/category-strip";
import { JobSection } from "@/components/job-section";
import { RightSidebar } from "@/components/right-sidebar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const featuredJobs = await prisma.job.findMany({
    include: {
      company: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  const latestJobs = await prisma.job.findMany({
    include: {
      company: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <TopHero />
      <CategoryStrip />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            <JobSection
              title="注目の求人"
              jobs={featuredJobs}
              moreHref="/jobs"
              moreLabel="注目の求人をもっと見る"
            />

            <JobSection
              title="新着求人"
              jobs={latestJobs}
              moreHref="/jobs"
              moreLabel="新着の求人をもっと見る"
            />
          </div>

          <RightSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}