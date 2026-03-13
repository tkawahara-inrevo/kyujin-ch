import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { MessageListCard } from "@/components/message-list-card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      application: { userId: currentUser.id },
    },
    include: {
      application: {
        include: {
          job: { include: { company: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 未読数を取得
  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderType: "COMPANY",
      isRead: false,
    },
    _count: true,
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count]));

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <section className="border-b border-[#dddddd] pb-8">
              <h1 className="text-[40px] font-bold text-[#333]">メッセージ一覧</h1>

              {conversations.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {conversations.map((conv) => (
                    <MessageListCard
                      key={conv.id}
                      id={conv.id}
                      companyName={conv.application.job.company.name}
                      title={conv.application.job.title}
                      updatedAt={new Date(conv.updatedAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                      unread={(unreadMap.get(conv.id) ?? 0) > 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyStateCard
                    title="まだメッセージはありません"
                    description={
                      "求人に応募すると企業とメッセージのやりとりができます。"
                    }
                  />
                </div>
              )}
            </section>
          </div>

          <ActionSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}
