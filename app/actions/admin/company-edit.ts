"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { buildContactFullName } from "@/lib/company-account";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdminAction() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function normalizeCorporateNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export type AdminCompanyEditData = {
  // アカウント情報
  companyName: string;
  corporateNumber: string;
  username: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  // 企業プロフィール
  businessDescription: string;
  description: string;
  industry: string;
  employeeCount: string;
  foundedYear: string;
  capital: string;
  websiteUrl: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
};

export async function updateCompanyByAdmin(companyId: string, data: AdminCompanyEditData) {
  await requireAdminAction();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { companyUserId: true },
  });
  if (!company) throw new Error("企業が見つかりません");
  if (!company.companyUserId) throw new Error("企業担当ユーザーが紐づいていません");

  const companyName = data.companyName.trim();
  const corporateNumber = normalizeCorporateNumber(data.corporateNumber);
  const username = data.username.trim().toLowerCase();
  const lastName = data.lastName.trim();
  const firstName = data.firstName.trim();
  const phone = data.phone.trim() || null;
  const email = data.email.trim().toLowerCase();

  if (!companyName) throw new Error("会社名を入力してください");
  if (corporateNumber && !/^\d{13}$/.test(corporateNumber)) throw new Error("法人番号は13桁の数字で入力してください");
  if (!username) throw new Error("ユーザー名を入力してください");
  if (!email) throw new Error("メールアドレスを入力してください");

  const [sameEmailUser, sameUsernameUser] = await Promise.all([
    prisma.user.findFirst({
      where: { email, NOT: { id: company.companyUserId } },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { username, NOT: { id: company.companyUserId } },
      select: { id: true },
    }),
  ]);
  if (sameEmailUser) throw new Error("そのメールアドレスは既に使われています");
  if (sameUsernameUser) throw new Error("そのユーザー名は既に使われています");

  // location を prefecture + city + addressLine から生成
  const locationParts = [data.prefecture, data.city, data.addressLine].map((s) => s.trim()).filter(Boolean);
  const location = locationParts.join(" ") || null;

  await prisma.$transaction([
    prisma.company.update({
      where: { id: companyId },
      data: {
        name: companyName,
        ...(corporateNumber ? { corporateNumber } : {}),
        businessDescription: data.businessDescription.trim() || null,
        description: data.description.trim() || null,
        industry: data.industry || null,
        employeeCount: data.employeeCount || null,
        foundedYear: data.foundedYear.trim() || null,
        capital: data.capital.trim() || null,
        websiteUrl: data.websiteUrl.trim() || null,
        postalCode: data.postalCode.trim() || null,
        prefecture: data.prefecture.trim() || null,
        city: data.city.trim() || null,
        addressLine: data.addressLine.trim() || null,
        location,
      },
    }),
    prisma.user.update({
      where: { id: company.companyUserId },
      data: {
        email,
        username,
        lastName,
        firstName,
        name: buildContactFullName(lastName, firstName),
        phone,
      },
    }),
  ]);

  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/admin/companies");
}

export async function resetCompanyPasswordByAdmin(companyId: string, newPassword: string) {
  await requireAdminAction();

  if (!newPassword || newPassword.length < 8) throw new Error("パスワードは8文字以上で入力してください");

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { companyUserId: true },
  });
  if (!company?.companyUserId) throw new Error("企業担当ユーザーが見つかりません");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: company.companyUserId },
      data: { password: hashed },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: { adminPassword: newPassword },
    }),
  ]);

  revalidatePath(`/admin/companies/${companyId}`);
}
