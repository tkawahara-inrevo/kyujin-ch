import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApplicantActions } from "./applicant-actions";
import { requireCompany } from "@/lib/auth-helpers";
import Link from "next/link";

export default async function CompanyApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return notFound();

  const application = await prisma.application.findFirst({
    where: { id, job: { companyId: company.id } },
    include: {
      user: true,
      job: true,
      conversation: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!application) return notFound();

  // 求職者からの未読メッセージを既読にする
  if (application.conversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: application.conversation.id,
        senderType: "USER",
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-3">
        <Link href="/company/applicants" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666] transition hover:bg-[#e5e5e5]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-[#1e3a5f]">応募者詳細</h1>
      </div>

      {/* コンパクトな求職者情報 + 応募情報 */}
      <div className="mt-5 rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[14px] font-bold text-[#2f6cff]">
              {application.user.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#333]">{application.user.name}</p>
              <p className="text-[12px] text-[#888]">{application.user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
            <span className="text-[#888]">電話：<span className="text-[#555]">{application.user.phone || "未設定"}</span></span>
            <span className="text-[#888]">履歴書：<span className="text-[#555]">{application.user.resumeUrl ? "あり" : "なし"}</span></span>
            <span className="text-[#888]">職務経歴書：<span className="text-[#555]">{application.user.careerHistoryUrl ? "あり" : "なし"}</span></span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#f0f0f0] pt-3 text-[13px]">
          <span className="text-[#888]">応募求人：
            <Link href={`/company/jobs/${application.job.id}/edit`} className="text-[#2f6cff] hover:underline">
              {application.job.title}
            </Link>
          </span>
          <span className="text-[#888]">応募日：<span className="text-[#555]">{application.createdAt.toLocaleDateString("ja-JP")}</span></span>
        </div>
        {application.motivation && (
          <div className="mt-3 border-t border-[#f0f0f0] pt-3">
            <p className="text-[12px] font-semibold text-[#888]">志望動機</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#444]">{application.motivation}</p>
          </div>
        )}
      </div>

      {/* ステータス + メッセージ */}
      <div className="mt-5">
        <ApplicantActions
          applicationId={application.id}
          currentStatus={application.status}
          messages={application.conversation?.messages ?? []}
          conversationId={application.conversation?.id}
        />
      </div>
    </div>
  );
}
