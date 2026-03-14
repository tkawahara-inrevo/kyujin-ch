import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import SettingsEditForm from "./settings-edit-form";

export default async function CompanySettingsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    include: { companyUser: true },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">設定</h1>

      <div className="mt-6 max-w-[600px] space-y-6">
        <Section title="企業プロフィール">
          <Row label="企業名" value={company.name} />
          <Row label="説明" value={company.description || "未設定"} />
          <Row label="WebサイトURL" value={company.websiteUrl || "未設定"} />
          <Row label="所在地" value={company.location || "未設定"} />
        </Section>

        <Section title="担当者情報">
          <Row label="氏名" value={company.companyUser?.name || "未設定"} />
          <Row label="メール" value={company.companyUser?.email || "未設定"} />
          <Row label="電話番号" value={company.companyUser?.phone || "未設定"} />
        </Section>

        <SettingsEditForm
          companyName={company.name}
          description={company.description || ""}
          websiteUrl={company.websiteUrl || ""}
          location={company.location || ""}
          contactName={company.companyUser?.name || ""}
          phone={company.companyUser?.phone || ""}
        />

        <div className="pt-2">
          <Link
            href="/company/settings/password"
            className="inline-block rounded-[8px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#1d5ae0]"
          >
            パスワードを変更する →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-[16px] font-bold text-[#333]">{title}</h2>
      <dl className="space-y-3 text-[14px]">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[120px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">{value}</dd>
    </div>
  );
}
