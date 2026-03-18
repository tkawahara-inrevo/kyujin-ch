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
          <p className="mt-2 text-[13px] text-[#888]">新しいお問い合わせを新着順で確認できるよ!</p>
        </div>
        <div className="rounded-[12px] bg-white px-4 py-3 text-right shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-semibold text-[#888]">件数</p>
          <p className="mt-1 text-[22px] font-bold text-[#2f6cff]">{inquiries.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="hidden grid-cols-[120px_120px_160px_160px_minmax(0,1fr)_100px] gap-4 border-b border-[#eef2f7] px-5 py-4 text-[12px] font-bold text-[#888] md:grid">
          <span>受付日時</span>
          <span>カテゴリ</span>
          <span>お名前</span>
          <span>メール</span>
          <span>内容</span>
          <span>状態</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-[14px] text-[#999]">まだお問い合わせはありません</div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="px-5 py-4">
                <div className="grid gap-3 md:grid-cols-[120px_120px_160px_160px_minmax(0,1fr)_100px] md:items-start">
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
                    {inquiry.phone && <p className="mt-1 text-[11px] font-normal text-[#888]">{inquiry.phone}</p>}
                  </div>
                  <div className="min-w-0 text-[13px] text-[#555]">{inquiry.email}</div>
                  <div className="text-[13px] leading-6 text-[#444]">{inquiry.body}</div>
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
                </div>
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
