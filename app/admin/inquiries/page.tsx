import Link from "next/link";
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

export default async function AdminInquiriesPage() {
  await requireAdmin();

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">お問い合わせ</h1>
          <p className="mt-2 text-[13px] text-[#888]">
            届いたお問い合わせの内容を一覧と詳細で確認できます。
          </p>
        </div>
        <div className="rounded-[12px] bg-white px-4 py-3 text-right shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-semibold text-[#888]">件数</p>
          <p className="mt-1 text-[22px] font-bold text-[#2f6cff]">{inquiries.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="hidden grid-cols-[130px_120px_160px_180px_minmax(0,1fr)_100px_110px] gap-4 border-b border-[#eef2f7] px-5 py-4 text-[12px] font-bold text-[#888] lg:grid">
          <span>受信日時</span>
          <span>カテゴリ</span>
          <span>お名前</span>
          <span>メール</span>
          <span>内容</span>
          <span>状態</span>
          <span>詳細</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-[14px] text-[#999]">
            まだお問い合わせはありません
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="px-5 py-4">
                <div className="hidden gap-3 lg:grid lg:grid-cols-[130px_120px_160px_180px_minmax(0,1fr)_100px_110px] lg:items-start">
                  <div className="text-[12px] text-[#666]">{formatDateTime(inquiry.createdAt)}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                        inquiry.category === "BUG_REPORT"
                          ? "bg-[#fee2e2] text-[#dc2626]"
                          : "bg-[#dbeafe] text-[#2563eb]"
                      }`}
                    >
                      {CATEGORY_LABELS[inquiry.category]}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-[#333]">
                    {inquiry.name}
                    {inquiry.phone ? (
                      <p className="mt-1 text-[11px] font-normal text-[#888]">{inquiry.phone}</p>
                    ) : null}
                  </div>
                  <div className="min-w-0 break-all text-[13px] text-[#555]">{inquiry.email}</div>
                  <div className="text-[13px] leading-6 text-[#444]">{truncateBody(inquiry.body)}</div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
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
                  <div>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="inline-flex rounded-[10px] border border-[#d8dce6] px-3 py-2 text-[12px] font-bold text-[#2f6cff] transition hover:border-[#2f6cff] hover:bg-[#f3f7ff]"
                    >
                      内容を見る
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="block rounded-[14px] border border-[#edf2f7] p-4 transition hover:border-[#d5def5] hover:bg-[#fafcff] lg:hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-bold text-[#1f2937]">{inquiry.name}</p>
                      <p className="mt-1 text-[12px] text-[#666]">{formatDateTime(inquiry.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                        inquiry.category === "BUG_REPORT"
                          ? "bg-[#fee2e2] text-[#dc2626]"
                          : "bg-[#dbeafe] text-[#2563eb]"
                      }`}
                    >
                      {CATEGORY_LABELS[inquiry.category]}
                    </span>
                  </div>
                  <p className="mt-3 break-all text-[13px] text-[#555]">{inquiry.email}</p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-[#444]">
                    {inquiry.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                        inquiry.status === "OPEN"
                          ? "bg-[#fff7cc] text-[#b7791f]"
                          : inquiry.status === "IN_PROGRESS"
                            ? "bg-[#e0f2fe] text-[#0369a1]"
                            : "bg-[#dcfce7] text-[#166534]"
                      }`}
                    >
                      {STATUS_LABELS[inquiry.status]}
                    </span>
                    <span className="text-[12px] font-bold text-[#2f6cff]">詳細を見る</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
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

function truncateBody(body: string) {
  return body.length > 80 ? `${body.slice(0, 80)}...` : body;
}
