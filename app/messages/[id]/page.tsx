import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { MessageThread } from "@/components/message-thread";
import { prisma } from "@/lib/prisma";

type MessageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MessageDetailPage({
  params,
}: MessageDetailPageProps) {
  await params;

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
            <section className="border-b border-[#dddddd] pb-8">
              <h1 className="text-[40px] font-bold text-[#333]">メッセージ詳細</h1>

              <div className="mt-4">
                <p className="text-[28px] font-bold text-[#333]">すごくいい株式会社</p>
                <p className="mt-3 text-[20px] text-[#444]">
                  マーケター募集！求人タイトルはこんな感じ
                </p>
                <p className="mt-3 text-[14px] text-[#999]">
                  応募ID：***************
                </p>
              </div>

              <div className="mt-4">
                <MessageThread />
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