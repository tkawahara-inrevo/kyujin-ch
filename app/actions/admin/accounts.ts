"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildContactFullName } from "@/lib/company-account";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) throw new Error("Unauthorized");
  return session.user.id;
}

function normalizeCorporateNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function generateTemporaryPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function issueCompanyAccount(data: {
  companyName: string;
  corporateNumber: string;
  username: string;
  lastName: string;
  firstName: string;
  phone?: string;
  email: string;
}) {
  await requireAdmin();

  const companyName = data.companyName.trim();
  const corporateNumber = normalizeCorporateNumber(data.corporateNumber);
  const username = data.username.trim().toLowerCase();
  const lastName = data.lastName.trim();
  const firstName = data.firstName.trim();
  const phone = data.phone?.trim() || null;
  const email = data.email.trim().toLowerCase();

  if (!companyName) throw new Error("会社名を入力してください");
  if (!/^\d{13}$/.test(corporateNumber)) throw new Error("法人番号は13桁の数字で入力してください");
  if (!username) throw new Error("ユーザー名を入力してください");
  if (!lastName) throw new Error("姓を入力してください");
  if (!firstName) throw new Error("名を入力してください");
  if (!phone) throw new Error("電話番号を入力してください");
  if (!email) throw new Error("メールアドレスを入力してください");

  const [existingUserByEmail, existingUserByUsername, existingCompanyByCorporateNumber] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
    prisma.company.findUnique({ where: { corporateNumber }, select: { id: true } }),
  ]);

  if (existingUserByEmail) throw new Error("そのメールアドレスは既に使われています");
  if (existingUserByUsername) throw new Error("そのユーザー名は既に使われています");
  if (existingCompanyByCorporateNumber) throw new Error("その法人番号の企業は既に登録されています");

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const fullName = buildContactFullName(lastName, firstName);

  const company = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        name: fullName,
        email,
        username,
        password: hashedPassword,
        role: "COMPANY",
        firstName,
        lastName,
        phone,
      },
    });

    return tx.company.create({
      data: {
        name: companyName,
        corporateNumber,
        companyUserId: user.id,
      },
    });
  });

  revalidatePath("/admin/companies");

  return {
    companyId: company.id,
    temporaryPassword,
  };
}

export async function toggleCompanyActive(companyId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { isActive },
  });
  revalidatePath("/admin/companies");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
  revalidatePath("/admin/jobseekers");
}
