import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { prisma } from "@/lib/prisma";

export default async function MyPageEdit() {
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
              <h1 className="text-[40px] font-bold text-[#333]">マイページ</h1>

              <div className="mt-6 max-w-[420px] space-y-4">
                <div>
                  <label className="mb-2 block text-[14px] font-bold text-[#333]">
                    氏名 *
                  </label>
                  <input
                    className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-bold text-[#333]">
                    メールアドレス *
                  </label>
                  <input
                    className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
                    defaultValue="applicant@test.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-bold text-[#333]">
                    電話番号 *
                  </label>
                  <input
                    className="h-[48px] w-full rounded-[8px] border border-[#d1d1d1] bg-white px-4 text-[16px] outline-none"
                    defaultValue="090-0000-0000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-bold text-[#333]">
                    通知設定*
                  </label>
                  <div className="flex items-center">
                    <div className="relative h-[28px] w-[44px] rounded-full bg-[#2f6cff]">
                      <div className="absolute right-[2px] top-[2px] h-[24px] w-[24px] rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <button className="mt-6 w-full rounded-[10px] bg-[#2f6cff] px-6 py-4 text-[16px] font-bold text-white transition hover:opacity-90">
                決定する
              </button>

              <p className="mt-4 text-right text-[12px] text-[#999]">登録日 2026/02/20</p>
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