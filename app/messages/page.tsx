import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { MessageListCard } from "@/components/message-list-card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
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
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <h1 className="mb-5 text-[22px] font-bold text-[#333]">メッセージ</h1>

            {conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <MessageListCard
                    key={conv.id}
                    id={conv.id}
                    companyName={conv.application.job.company.name}
                    title={conv.application.job.title}
                    lastMessage={conv.messages[0]?.body || (conv.messages[0]?.attachmentName ? `📎 ${conv.messages[0]?.attachmentName}` : undefined)}
                    updatedAt={new Date(conv.updatedAt).toLocaleDateString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                    })}
                    unreadCount={unreadMap.get(conv.id) ?? 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                title="まだメッセージはありません"
                description="求人に応募すると企業とメッセージのやりとりができます。"
              />
            )}
          </div>

          <ActionSidebar isLoggedIn={true} />
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
