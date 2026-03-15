import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";
import { ApplicantActions } from "./applicant-actions";

function DocumentLink({
  href,
  label,
}: {
  href?: string | null;
  label: string;
}) {
  if (!href) {
    return (
      <span className="inline-flex rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-semibold text-[#9aa2af]">
        {label}なし
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] font-semibold text-[#2f6cff] hover:bg-[#e4edff]"
    >
      {label}を見る
    </a>
  );
}

export default async function CompanyApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCompany();

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    notFound();
  }

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

  if (!application) {
    notFound();
  }

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

  const resumeHref = application.user.resumeUrl
    ? `/api/company/applicant-documents?applicationId=${application.id}&docType=resume`
    : null;
  const careerHistoryHref = application.user.careerHistoryUrl
    ? `/api/company/applicant-documents?applicationId=${application.id}&docType=careerHistory`
    : null;

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-3">
        <Link
          href="/company/applicants"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666] transition hover:bg-[#e5e5e5]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[20px] font-bold text-[#1e3a5f]">応募者詳細</h1>
      </div>

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

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
            <span className="text-[#888]">
              電話番号:{" "}
              <span className="text-[#555]">{application.user.phone || "未設定"}</span>
            </span>
            <DocumentLink href={resumeHref} label="履歴書" />
            <DocumentLink href={careerHistoryHref} label="職務経歴書" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#f0f0f0] pt-3 text-[13px]">
          <span className="text-[#888]">
            応募求人:{" "}
            <Link
              href={`/company/jobs/${application.job.id}/edit`}
              className="text-[#2f6cff] hover:underline"
            >
              {application.job.title}
            </Link>
          </span>
          <span className="text-[#888]">
            応募日:{" "}
            <span className="text-[#555]">
              {application.createdAt.toLocaleDateString("ja-JP")}
            </span>
          </span>
        </div>

        {application.motivation && (
          <div className="mt-3 border-t border-[#f0f0f0] pt-3">
            <p className="text-[12px] font-semibold text-[#888]">志望動機</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#444]">
              {application.motivation}
            </p>
          </div>
        )}
      </div>

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
