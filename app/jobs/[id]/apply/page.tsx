import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { ApplyForm } from "./apply-form";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rankRecommendedJobs } from "@/lib/recommended-jobs";

type ApplyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "応相談";
  if (min && max && min === max) return `${min}万円`;
  if (min && max) return `${min}万円`;
  if (min) return `${min}万円〜`;
  return `〜${max}万円`;
}

export default async function ApplyPage({
  params,
}: ApplyPageProps) {
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

  const hasApplied = isLoggedIn
    ? !!(await prisma.application.findUnique({
        where: { userId_jobId: { userId: session!.user!.id!, jobId: job.id } },
      }))
    : false;

  const recommendationCandidates = await prisma.job.findMany({
    where: {
      NOT: {
        id: job.id,
      },
      isPublished: true,
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

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <div className="border-b border-[#dcdcdc] pb-8">
              <p className="text-[24px] font-bold text-[#333]">応募フォーム</p>

              <h1 className="mt-2 text-[40px] font-bold leading-[1.5] text-[#333]">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#4b4b4b] px-3 py-1 text-[11px] font-bold text-white">
                  営業
                </span>
                <span className="rounded-full bg-[#efefef] px-3 py-1 text-[11px] font-bold text-[#666]">
                  未経験歓迎
                </span>
                <span className="rounded-full bg-[#efefef] px-3 py-1 text-[11px] font-bold text-[#666]">
                  中途採用
                </span>
              </div>

              <p className="mt-4 text-[24px] font-bold text-[#333]">{job.company.name}</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-[14px] text-[#444]">
                  <Image src="/assets/Map_Pin.png" alt="" width={18} height={18} />
                  <span>{job.location ?? "勤務地未設定"}</span>
                </div>
                <div className="flex items-center gap-3 text-[14px] text-[#444]">
                  <span className="text-[28px] leading-none">¥</span>
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ApplyForm jobId={job.id} />
            </div>

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar applyHref={`/jobs/${job.id}/apply`} primaryLabel="今すぐ応募する" isLoggedIn={isLoggedIn} hasApplied={hasApplied} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
