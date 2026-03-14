import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminMessageViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          user: true,
          job: { include: { company: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const { user } = conversation.application;
  const { job } = conversation.application;

  return (
    <div className="p-6 lg:p-10">
      <Link href={`/admin/jobseekers/${user.id}`} className="text-[13px] text-[#888] hover:text-[#2f6cff]">
        ← 求職者詳細に戻る
      </Link>

      <h1 className="mt-4 text-[20px] font-bold text-[#1e293b]">メッセージ確認</h1>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
          <span className="text-[#888]">求職者：<span className="font-semibold text-[#333]">{user.name}</span></span>
          <span className="text-[#888]">企業：<span className="font-semibold text-[#333]">{job.company.name}</span></span>
          <span className="text-[#888]">求人：<span className="text-[#555]">{job.title}</span></span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#f8f8f8] p-4" style={{ maxHeight: "600px", overflowY: "auto" }}>
        <div className="space-y-2">
          {conversation.messages.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[#aaa]">メッセージはありません</p>
          ) : (
            conversation.messages.map((msg) => {
              const isCompany = msg.senderType === "COMPANY";
              const isAdmin = msg.senderType === "ADMIN";
              return (
                <div key={msg.id} className={`flex ${isCompany || isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <p className={`mb-0.5 text-[10px] ${isCompany || isAdmin ? "text-right" : "text-left"} text-[#aaa]`}>
                      {isAdmin ? "管理者" : isCompany ? "企業" : "求職者"}
                    </p>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        isCompany
                          ? "rounded-br-md bg-[#2f6cff] text-white"
                          : isAdmin
                            ? "rounded-br-md bg-[#f59e0b] text-white"
                            : "rounded-bl-md bg-white text-[#333] shadow-sm"
                      }`}
                    >
                      {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}
                      {msg.attachmentName && (
                        <a
                          href={`/api/messages/attachments/${msg.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold ${
                            isCompany || isAdmin
                              ? "bg-white/15 text-white hover:bg-white/20"
                              : "bg-[#f3f6ff] text-[#2f6cff] hover:bg-[#e7eeff]"
                          }`}
                        >
                          <span>📎</span>
                          <span className="truncate">{msg.attachmentName}</span>
                        </a>
                      )}
                    </div>
                    <p className={`mt-0.5 text-[10px] text-[#bbb] ${isCompany || isAdmin ? "text-right" : "text-left"}`}>
                      {new Date(msg.createdAt).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
