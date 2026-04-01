import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function KpiCard({
  label,
  value,
  href,
  colorClass,
  sub,
}: {
  label: string;
  value: string | number;
  href: string;
  colorClass: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[18px] bg-white p-6 shadow-[0_2px_10px_rgba(37,56,88,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,56,88,0.08)]"
    >
      <p className="text-[16px] font-bold text-[#2b2f38]">{label}</p>
      <p className={`mt-5 text-[18px] font-bold md:text-[24px] ${colorClass}`}>{value}</p>
      {sub ? <p className="mt-3 text-[13px] text-[#7f8795]">{sub}</p> : null}
    </Link>
  );
}

type NoticeItem = {
  id: string;
  type: "message" | "application";
  createdAt: Date;
  jobTitle: string;
  userName: string;
  href: string;
  isUnread: boolean;
};

export default async function CompanyDashboardPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentBillingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    monthlyApps,
    publishedJobs,
    unreadMessages,
    recentApplications,
    recentUnreadMessages,
    currentMonthCharges,
    lifetimeCharges,
  ] = await Promise.all([
    prisma.application.count({
      where: { job: { companyId: company.id }, createdAt: { gte: startOfMonth } },
    }),
    prisma.job.count({
      where: { companyId: company.id, reviewStatus: "PUBLISHED", isDeleted: false },
    }),
    prisma.message.count({
      where: {
        isRead: false,
        senderType: "USER",
        conversation: { application: { job: { companyId: company.id } } },
      },
    }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: { user: true, job: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.message.findMany({
      where: {
        isRead: false,
        senderType: "USER",
        conversation: { application: { job: { companyId: company.id } } },
      },
      include: {
        conversation: {
          include: {
            application: {
              include: {
                job: true,
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.charge.aggregate({
      where: {
        isValid: true,
        billingMonth: currentBillingMonth,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
    }),
    prisma.charge.aggregate({
      where: {
        isValid: true,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
    }),
  ]);

  const notices: NoticeItem[] = [
    ...recentUnreadMessages.map((message) => ({
      id: `message-${message.id}`,
      type: "message" as const,
      createdAt: message.createdAt,
      jobTitle: message.conversation.application.job.title,
      userName: message.conversation.application.user.name ?? "応募者",
      href: `/company/messages?applicationId=${message.conversation.applicationId}`,
      isUnread: true,
    })),
    ...recentApplications.map((application) => ({
      id: `application-${application.id}`,
      type: "application" as const,
      createdAt: application.createdAt,
      jobTitle: application.job.title,
      userName: application.user.name ?? "応募者",
      href: `/company/applicants/${application.id}`,
      isUnread: application.companyViewedAt === null,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">ダッシュボード</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="当月応募数"
          value={monthlyApps}
          href="/company/applicants"
          colorClass="text-[#ff3158]"
        />
        <KpiCard
          label="掲載中求人"
          value={publishedJobs}
          href="/company/jobs"
          colorClass="text-[#2f6cff]"
        />
        <KpiCard
          label="概算費用"
          value={`¥ ${(lifetimeCharges._sum.amount ?? 0).toLocaleString()}`}
          href="/company/billing"
          colorClass="text-[#f59e0b]"
          sub={`当月 ¥ ${(currentMonthCharges._sum.amount ?? 0).toLocaleString()}`}
        />
        <KpiCard
          label="未読メッセージ"
          value={unreadMessages}
          href="/company/messages"
          colorClass="text-[#22c55e]"
        />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[24px] font-bold text-[#2b2f38]">お知らせ</h2>
          <Link href="/company/messages" className="text-[15px] font-bold text-[#2b2f38] hover:opacity-70">
            すべて見る →
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
          {notices.length === 0 ? (
            <div className="px-4 py-10 text-center text-[#9aa3b2]">新しいお知らせはありません</div>
          ) : (
            <div className="divide-y divide-[#edf0f5]">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={notice.href}
                  className={`block px-4 py-4 transition hover:bg-[#fafcff] md:px-6 ${
                    notice.isUnread ? "bg-[#f9fbff]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-[14px] font-bold md:text-[15px] ${
                        notice.isUnread ? "text-[#2b2f38]" : "text-[#4b5565]"
                      }`}
                    >
                      {notice.type === "message"
                        ? `新着メッセージがあります（求人名：${notice.jobTitle}）`
                        : `新規応募がありました（求人名：${notice.jobTitle}）`}
                    </p>
                    <p className="shrink-0 text-[12px] font-medium text-[#98a2b3]">
                      {notice.createdAt.toLocaleDateString("ja-JP")}{" "}
                      {notice.createdAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {notice.isUnread ? (
                      <span className="rounded-full bg-[#ff3158] px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#e6ebf4] px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                        確認済み
                      </span>
                    )}
                    <p className="text-[13px] text-[#667085]">{notice.userName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
