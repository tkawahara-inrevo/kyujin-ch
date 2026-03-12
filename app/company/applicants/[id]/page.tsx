import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApplicantActions } from "./applicant-actions";
import { requireCompany } from "@/lib/auth-helpers";

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
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">応募者詳細</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 求職者情報 */}
        <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-bold text-[#333]">求職者情報</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <Row label="氏名" value={application.user.name} />
            <Row label="メール" value={application.user.email} />
            <Row label="電話番号" value={application.user.phone || "未設定"} />
            <Row label="履歴書" value={application.user.resumeUrl ? "あり" : "なし"} />
            <Row label="職務経歴書" value={application.user.careerHistoryUrl ? "あり" : "なし"} />
          </dl>
        </div>

        {/* 応募情報 */}
        <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-bold text-[#333]">応募情報</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <Row label="求人" value={application.job.title} />
            <Row label="応募日" value={application.createdAt.toLocaleDateString("ja-JP")} />
            <Row label="志望動機" value={application.motivation || "未入力"} />
          </dl>
          <ApplicantActions
            applicationId={application.id}
            currentStatus={application.status}
            messages={application.conversation?.messages ?? []}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[100px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">{value}</dd>
    </div>
  );
}
