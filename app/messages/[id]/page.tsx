import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActionSidebar } from "@/components/action-sidebar";
import { MessageThread } from "@/components/message-thread";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
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
    <main className="min-h-screen bg-[#f7f7f7] pb-16 lg:pb-0">
      <Header />

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_252px]">
          <div>
            {/* ヘッダー */}
            <div className="mb-4 flex items-center gap-3">
              <Link href="/messages" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666] transition hover:bg-[#e5e5e5]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="truncate text-[16px] font-bold text-[#333]">{job.company.name}</h1>
                <p className="truncate text-[13px] text-[#888]">{job.title}</p>
              </div>
            </div>

            {/* メッセージスレッド */}
            <MessageThread
              conversationId={id}
              messages={conversation.messages.map((m) => ({
                id: m.id,
                body: m.body,
                attachmentName: m.attachmentName,
                senderType: m.senderType,
                senderId: m.senderId,
                createdAt: m.createdAt,
              }))}
              currentUserId={currentUser.id}
            />
          </div>

          <ActionSidebar isLoggedIn={true} />
        </div>
      </div>

      <MobileBottomBar />
      <Footer />
    </main>
  );
}
