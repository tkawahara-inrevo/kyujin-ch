import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { RecommendSection } from "@/components/recommend-section";
import { MessageListCard } from "@/components/message-list-card";
import { prisma } from "@/lib/prisma";

const messageItems = [
  {
    id: "1",
    companyName: "すごくいい株式会社",
    title: "マーケター募集！求人タイトルはこんな感じ",
    updatedAt: "2026/02/20",
    unread: true,
  },
  {
    id: "2",
    companyName: "すごくいい株式会社",
    title: "マーケター募集！求人タイトルはこんな感じ",
    updatedAt: "2026/02/20",
    unread: true,
  },
  {
    id: "3",
    companyName: "すごくいい株式会社",
    title: "マーケター募集！求人タイトルはこんな感じ",
    updatedAt: "2026/02/20",
    unread: false,
  },
  {
    id: "4",
    companyName: "すごくいい株式会社",
    title: "マーケター募集！求人タイトルはこんな感じ",
    updatedAt: "2026/02/20",
    unread: false,
  },
];

export default async function MessagesPage() {
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
              <h1 className="text-[40px] font-bold text-[#333]">メッセージ一覧</h1>

              <div className="mt-6 space-y-4">
                {messageItems.map((item) => (
                  <MessageListCard
                    key={item.id}
                    id={item.id}
                    companyName={item.companyName}
                    title={item.title}
                    updatedAt={item.updatedAt}
                    unread={item.unread}
                  />
                ))}
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