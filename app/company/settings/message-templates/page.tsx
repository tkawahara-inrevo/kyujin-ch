import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { MessageTemplatesClient } from "./message-templates-client";

export default async function MessageTemplatesPage() {
  const session = await requireCompany();

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const templates = await prisma.messageTemplate.findMany({
    where: { companyId: company.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/company/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666] transition hover:bg-[#e5e5e5]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2b2f38]">メッセージテンプレート</h1>
      </div>
      <p className="mt-2 text-[14px] text-[#888]">応募者へのメッセージで使用できるテンプレートを管理します。</p>

      <MessageTemplatesClient templates={templates} />
    </div>
  );
}
