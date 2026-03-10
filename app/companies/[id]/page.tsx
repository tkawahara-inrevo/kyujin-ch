import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { prisma } from "@/lib/prisma";
import { CompanyHeaderBlock } from "@/components/company-header-block";
import { CompanyJobStrip } from "@/components/company-job-strip";
import { CompanyStory } from "@/components/company-story";
import { CompanyInfoTable } from "@/components/company-info-table";
import { CompanyReviews } from "@/components/company-reviews";
import { CompanyReviewForm } from "@/components/company-review-form";

type CompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyPage({
  params,
}: CompanyPageProps) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const recommendedJobs = await prisma.job.findMany({
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

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <CompanyHeaderBlock
              companyName={company.name}
              location={(company as { location?: string | null }).location ?? "福岡県"}
              description={company.description}
            />

            {company.jobs.length > 0 && (
              <CompanyJobStrip
                jobs={company.jobs.map((job) => ({
                  id: job.id,
                  title: job.title,
                }))}
              />
            )}

            <CompanyStory companyName={company.name} />
            <CompanyInfoTable />

            {company.jobs.length > 0 && (
              <section className="mt-12">
                <div className="bg-[#2f6cff] px-4 py-2 text-[14px] font-bold text-white">
                  募集中の求人
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {company.jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="text-[11px] text-[#333]">
                      <p>[Webマーケター] フルリ</p>
                      <p>モート/フルフレックス</p>
                      <p className="font-bold text-[#ff3158]">マーケター</p>
                      <div className="mt-2 h-[74px] rounded-[8px] bg-[#efefef]" />
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-right text-[11px] text-[#999]">掲載日 2026/02/20</p>

                <div className="mt-5 text-center">
                  <p className="text-[13px] font-bold text-[#2f6cff]">
                    最短でこのくらいで応募完了！
                  </p>
                  <button className="mt-4 w-full rounded-[10px] bg-[#2f6cff] px-6 py-4 text-[15px] font-bold text-white transition hover:opacity-90">
                    応募する
                  </button>
                </div>
              </section>
            )}

            <CompanyReviews />
            <CompanyReviewForm />

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar applyHref="/jobs" primaryLabel="今すぐ応募する" />
        </div>
      </div>

      <Footer />
    </main>
  );
}