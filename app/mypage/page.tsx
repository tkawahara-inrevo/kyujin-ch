import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { ProfileSummary } from "@/components/profile-summary";
import { DocumentUploadCard } from "@/components/document-upload-card";
import { ReviewCard } from "@/components/review-card";
import { prisma } from "@/lib/prisma";

export default async function MyPage() {
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
            <ProfileSummary />

            <section className="mt-10">
              <h2 className="text-[40px] font-bold text-[#333]">書類アップロード</h2>
              <p className="mt-3 text-[14px] font-semibold text-[#777]">
                対応形式：PDF / DOCX / XLSX（最大10MB）
              </p>

              <div className="mt-6 space-y-4">
                <DocumentUploadCard title="履歴書" />
                <DocumentUploadCard
                  title="職務経歴書"
                  uploaded
                  fileName="keireki.pdf"
                />
              </div>
            </section>
            <section className="mt-12 border-t border-[#dddddd] pt-12">
              <div className="bg-[#ff1744] px-4 py-2 text-[18px] font-bold text-white">
                投稿したクチコミ
              </div>

              <div className="mt-4 space-y-4">
                <ReviewCard editable />
                <ReviewCard editable />
              </div>
            </section>

            {recommendedJobs.length > 0 && (
              <RecommendSection jobs={recommendedJobs} />
            )}
          </div>

          <ActionSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}