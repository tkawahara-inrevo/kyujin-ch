import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { prisma } from "@/lib/prisma";

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

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!job) {
    notFound();
  }

  const recommendedJobs = await prisma.job.findMany({
    where: {
      NOT: {
        id: job.id,
      },
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

            <div className="mt-8 rounded-[18px] bg-[#f4f4f4] p-6">
              <label className="block text-[14px] font-bold text-[#333]">
                志望動機・自己PR
              </label>

              <textarea
                className="mt-3 h-[120px] w-full rounded-[8px] border border-[#d7d7d7] bg-white px-4 py-3 text-[14px] outline-none"
                placeholder="本文"
              />

              <div className="mt-5 text-[13px] leading-[1.8] text-[#444]">
                <p className="font-bold">履歴書・職務経歴書も送付する（任意）</p>
                <p>
                  ※ プロフィールにアップロード済みの書類を応募に同封します。
                  未アップロードの場合はエラーになるので、先にプロフィールからアップしてね
                </p>
              </div>
            </div>

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar applyHref={`/jobs/${job.id}/apply`} />
        </div>
      </div>

      <Footer />
    </main>
  );
}