import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const CATEGORY_LABELS = {
  QUESTION: "質問",
  BUG_REPORT: "不具合報告",
} as const;

const STATUS_LABELS = {
  OPEN: "未対応",
  IN_PROGRESS: "対応中",
  CLOSED: "完了",
} as const;

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!inquiry) notFound();

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/inquiries" className="text-[13px] text-[#888] hover:text-[#2f6cff]">
        ← お問い合わせ一覧に戻る
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">お問い合わせ詳細</h1>
          <p className="mt-2 text-[13px] text-[#888]">
            受信日時: {formatDateTime(inquiry.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${
              inquiry.category === "BUG_REPORT"
                ? "bg-[#fee2e2] text-[#dc2626]"
                : "bg-[#dbeafe] text-[#2563eb]"
            }`}
          >
            {CATEGORY_LABELS[inquiry.category]}
          </span>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${
              inquiry.status === "OPEN"
                ? "bg-[#fff7cc] text-[#b7791f]"
                : inquiry.status === "IN_PROGRESS"
                  ? "bg-[#e0f2fe] text-[#0369a1]"
                  : "bg-[#dcfce7] text-[#166534]"
            }`}
          >
            {STATUS_LABELS[inquiry.status]}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-bold text-[#333]">送信者情報</h2>
          <dl className="mt-5 space-y-4 text-[14px]">
            <InfoRow label="お名前" value={inquiry.name} />
            <InfoRow label="メール" value={inquiry.email} breakAll />
            <InfoRow label="電話番号" value={inquiry.phone || "未入力"} />
            <InfoRow
              label="会員"
              value={
                inquiry.user
                  ? `${inquiry.user.name || "会員"} (${inquiry.user.email})`
                  : "ログインなし"
              }
              breakAll
            />
          </dl>
        </section>

        <section className="rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-bold text-[#333]">お問い合わせ内容</h2>
          <div className="mt-5 rounded-[12px] bg-[#f8fbff] p-5 text-[14px] leading-7 text-[#333]">
            <p className="whitespace-pre-wrap break-words">{inquiry.body}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-[88px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className={`text-[#333] ${breakAll ? "break-all" : ""}`}>{value}</dd>
    </div>
  );
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
