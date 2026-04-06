import Link from "next/link";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { checkCompanyProfileComplete } from "@/lib/company-profile";
import SettingsEditForm from "./settings-edit-form";

type SearchParams = Promise<{ alert?: string }>;

export default async function CompanySettingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await searchParams;
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    include: { companyUser: true },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const { isComplete, missingFields } = checkCompanyProfileComplete({
    name: company.name,
    businessDescription: company.businessDescription,
    prefecture: company.prefecture,
    location: company.location,
  });

  return (
    <div className="px-6 py-8 md:px-12 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight text-[#2b2f38]">設定</h1>
          <p className="mt-3 text-[18px] font-bold text-[#444]">プロフィール設定</p>
        </div>
      </div>

      {params?.alert === "profile_incomplete" && (
        <div className="mt-6 rounded-[12px] border border-[#fbbf24] bg-[#fffbeb] px-5 py-4">
          <p className="text-[14px] font-bold text-[#92400e]">求人作成にはプロフィールの入力が必要です</p>
          <p className="mt-1 text-[13px] text-[#78350f]">
            下記の「編集する」ボタンから、未入力の必須項目を入力してください。
          </p>
        </div>
      )}
      {!isComplete && params?.alert !== "profile_incomplete" && (
        <div className="mt-6 rounded-[12px] border border-[#fbbf24] bg-[#fffbeb] px-5 py-4">
          <p className="text-[14px] font-bold text-[#92400e]">プロフィールが未完成です</p>
          <p className="mt-1 text-[13px] text-[#78350f]">
            求人を作成するには以下の項目を入力してください：
            {missingFields.join("・")}
          </p>
        </div>
      )}

      <div className="mt-8 rounded-[18px] bg-white p-8 shadow-[0_2px_10px_rgba(37,56,88,0.04)]">
        <h2 className="text-[24px] font-bold text-[#2b2f38]">企業情報</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <InfoBlock label="会社名" value={company.name} />
          <InfoBlock label="所在地" value={company.location || "未設定"} />
          <InfoBlock label="業種" value={company.industry || "未設定"} />
          <InfoBlock label="従業員数" value={company.employeeCount || "未設定"} />
          <InfoBlock label="設立年" value={company.foundedYear || "未設定"} />
          <InfoBlock label="資本金" value={company.capital || "未設定"} />
          <InfoBlock label="WEBサイト" value={company.websiteUrl || "未設定"} />
          <InfoBlock label="担当者" value={company.companyUser?.name || "未設定"} />
          <InfoBlock label="メール" value={company.companyUser?.email || "未設定"} />
          <InfoBlock label="電話番号" value={company.companyUser?.phone || "未設定"} />
        </div>

        <div className="mt-6 rounded-[14px] bg-[#f7f9fd] p-5">
          <p className="text-[13px] font-bold text-[#7f8795]">
            事業内容
            {!company.businessDescription && <span className="ml-2 text-[#ff3158] text-[11px] font-bold">必須・未入力</span>}
          </p>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-[1.9] text-[#333]">
            {company.businessDescription || "未設定"}
          </p>
        </div>

        <div className="mt-4 rounded-[14px] bg-[#f7f9fd] p-5">
          <p className="text-[13px] font-bold text-[#7f8795]">会社説明</p>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-[1.9] text-[#333]">
            {company.description || "未設定"}
          </p>
        </div>
      </div>

      <div id="company-settings-edit" className="mt-8">
        <SettingsEditForm
          companyName={company.name}
          businessDescription={company.businessDescription || ""}
          description={company.description || ""}
          industry={company.industry || ""}
          employeeCount={company.employeeCount || ""}
          foundedYear={company.foundedYear || ""}
          capital={company.capital || ""}
          websiteUrl={company.websiteUrl || ""}
          postalCode={company.postalCode || ""}
          prefecture={company.prefecture || ""}
          city={company.city || ""}
          addressLine={company.addressLine || ""}
          contactName={company.companyUser?.name || ""}
          phone={company.companyUser?.phone || ""}
        />
      </div>

      <div className="mt-6">
        <Link
          href="/company/settings/password"
          className="inline-flex items-center justify-center rounded-[12px] border border-[#d6dce8] bg-white px-6 py-3 text-[14px] font-bold text-[#333] shadow-[0_2px_8px_rgba(37,56,88,0.04)] transition hover:bg-[#f7f9fd]"
        >
          パスワードを変更する
        </Link>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[#f7f9fd] px-5 py-4">
      <p className="text-[13px] font-bold text-[#7f8795]">{label}</p>
      <p className="mt-2 text-[15px] font-bold text-[#333]">{value}</p>
    </div>
  );
}
