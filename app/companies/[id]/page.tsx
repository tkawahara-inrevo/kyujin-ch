import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CompanyHeaderBlock } from "@/components/company-header-block";
import { CompanyInfoTable } from "@/components/company-info-table";
import { CompanyReviews } from "@/components/company-reviews";
import { CompanyReviewForm } from "@/components/company-review-form";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";

type CompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyPage({
  params,
}: CompanyPageProps) {
  const { id } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: {
        where: {
          isPublished: true,
          reviewStatus: "PUBLISHED",
          isDeleted: false,
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const recommendedJobs = await prisma.job.findMany({
    where: {
      NOT: { companyId: company.id },
      isPublished: true,
      reviewStatus: "PUBLISHED",
      isDeleted: false,
    },
    include: {
      company: true,
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <CompanyHeaderBlock
              companyName={company.name}
              location={company.location}
              description={company.description}
              businessDescription={company.businessDescription}
            />

            <CompanyInfoTable
              location={company.location}
              industry={company.industry}
              employeeCount={company.employeeCount}
              foundedYear={company.foundedYear}
              capital={company.capital}
              websiteUrl={company.websiteUrl}
            />

            {company.jobs.length > 0 && (
              <section className="mt-10">
                <div className="bg-[#2f6cff] px-4 py-2 text-[14px] font-bold text-white">
                  募集中の求人
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {company.jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block rounded-[10px] border border-[#e6e6e6] bg-white p-4 transition hover:border-[#2f6cff] hover:shadow-sm"
                    >
                      <p className="text-[13px] font-bold text-[#333] line-clamp-2">{job.title}</p>
                      {job.location && (
                        <p className="mt-1 text-[12px] text-[#888]">{job.location}</p>
                      )}
                      <p className="mt-1 text-[11px] text-[#aaa]">
                        {job.createdAt.toLocaleDateString("ja-JP")}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <CompanyReviews reviews={company.reviews} />
            {isLoggedIn ? (
              <CompanyReviewForm companyId={company.id} />
            ) : (
              <div className="mt-6 rounded-[14px] border border-[#e0e0e0] bg-white p-5 text-center text-[14px] text-[#888]">
                クチコミを投稿するには
                <span className="font-bold text-[#2f6cff]">ログイン</span>
                が必要です
              </div>
            )}

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
