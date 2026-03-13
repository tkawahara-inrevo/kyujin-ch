import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { MessageThread } from "@/components/message-thread";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type MessageDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MessageDetailPage({ params }: MessageDetailPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          job: { include: { company: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation || conversation.application.userId !== currentUser.id) {
    notFound();
  }

  // 企業からの未読メッセージを既読にする
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderType: "COMPANY",
      isRead: false,
    },
    data: { isRead: true },
  });

  const job = conversation.application.job;

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            <section className="border-b border-[#dddddd] pb-8">
              <h1 className="text-[40px] font-bold text-[#333]">メッセージ詳細</h1>

              <div className="mt-4">
                <p className="text-[28px] font-bold text-[#333]">
                  {job.company.name}
                </p>
                <p className="mt-3 text-[20px] text-[#444]">{job.title}</p>
                <p className="mt-3 text-[14px] text-[#999]">
                  応募ID：{conversation.applicationId}
                </p>
              </div>

              <div className="mt-4">
                <MessageThread
                  conversationId={id}
                  messages={conversation.messages.map((m) => ({
                    id: m.id,
                    body: m.body,
                    senderType: m.senderType,
                    senderId: m.senderId,
                    createdAt: m.createdAt,
                  }))}
                  currentUserId={currentUser.id}
                />
              </div>
            </section>
          </div>

          <ActionSidebar />
        </div>
      </div>

      <Footer />
    </main>
  );
}
