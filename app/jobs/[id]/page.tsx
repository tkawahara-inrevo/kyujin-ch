import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { CompanySummaryCard } from "@/components/company-summary-card";
import { RecommendSection } from "@/components/recommend-section";
import { JobMeta } from "@/components/job-meta";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { prisma } from "@/lib/prisma";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const detailParagraphs = {
  detail: `“地方企業”と
“可能性”を合流させる。
これからの日本を、地方から更新していくために、
ビジネスの根幹を創造する4つの事業で、
地方企業の力を解き放ち、新しい未来を
創り出していきます。`,
  target: `■採用代行事業
INREVOの主軸ブランド「ヒトトレ採用」。
採用戦略からスカウト・面接・内定フォローまでを一気通貫で支援するRPO（採用代行）サービス。
“採用できなければ全額返金”という成果保証型の仕組みで、企業の採用課題を根本から解決します。

■研修事業
「ヒトトレ研修」シリーズとして、若手〜管理職まで幅広い階層向け研修を展開。
対話と体験を重視し、「伝わる」だけでなく「できる」までをサポート。
企業の理念浸透やチームビルディングなど、人材育成の仕組みづくりを支援します。`,
  work: `■採用代行事業
INREVOの主軸ブランド「ヒトトレ採用」。
採用戦略からスカウト・面接・内定フォローまでを一気通貫で支援するRPO（採用代行）サービス。
“採用できなければ全額返金”という成果保証型の仕組みで、企業の採用課題を根本から解決します。`,
};

function TextBlock({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  return (
    <div className="grid gap-5 border-t border-[#dddddd] py-6 md:grid-cols-[84px_1fr]">
      <div className="text-[14px] font-bold text-[#333]">{heading}</div>
      <div className="whitespace-pre-line text-[14px] leading-[1.9] text-[#4b4b4b]">
        {body}
      </div>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: JobDetailPageProps) {
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
            <h1 className="text-[40px] font-bold leading-[1.5] text-[#333]">
              {job.title}
            </h1>

            <div className="relative mt-8 aspect-[1.95/1] overflow-hidden rounded-[10px] bg-[#ececec]">
              <Image
                src="/assets/Resume.png"
                alt={job.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
              <span className="absolute right-4 top-4 text-[12px] font-bold text-[#2f6cff]">
                注目
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
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

            <div className="mt-4 flex items-start justify-between gap-4">
              <JobMeta
                companyName={job.company.name}
                location={job.location}
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
              />

              <FavoriteToggleButton
                jobId={job.id}
                revalidatePaths={[`/jobs/${job.id}`, "/favorites"]}
              />
            </div>

            <div className="mt-6">
              <TextBlock heading="詳細" body={detailParagraphs.detail} />
              <TextBlock heading="対象" body={detailParagraphs.target} />
              <TextBlock heading="仕事内容" body={detailParagraphs.work} />
            </div>

            <div className="mt-2 text-center">
              <p className="text-[14px] font-bold text-[#2f6cff]">
                最短でこのくらいで応募完了！
              </p>

              <Link
                href={`/jobs/${job.id}/apply`}
                className="mt-4 block rounded-[10px] bg-[#2f6cff] px-6 py-4 text-center text-[15px] font-bold text-white transition hover:opacity-90"
              >
                応募する
              </Link>
            </div>

            <div className="mt-12">
              <CompanySummaryCard
                companyId={job.company.id}
                companyName={job.company.name}
                location={job.location}
                description={job.company.description}
                websiteUrl={
                  (job.company as { websiteUrl?: string | null }).websiteUrl ?? null
                }
              />
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