"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

function genTempPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

async function getCompanyForUser(userId: string) {
  const company = await prisma.company.findFirst({
    where: { users: { some: { id: userId } } },
    select: { id: true, name: true },
  });
  if (!company) throw new Error("企業情報が見つかりません");
  return company;
}

export async function inviteCompanyMember(email: string, name: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error("正しいメールアドレスを入力してください");
  }
  if (!trimmedName) throw new Error("名前を入力してください");

  const exists = await prisma.user.findUnique({ where: { email: trimmedEmail }, select: { id: true } });
  if (exists) throw new Error("このメールアドレスは既に使用されています");

  const company = await getCompanyForUser(session.user.id);
  const tempPassword = genTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 10);

  await prisma.user.create({
    data: {
      email: trimmedEmail,
      name: trimmedName,
      role: "COMPANY",
      password: hashed,
      companyId: company.id,
    },
  });

  const loginUrl = `${process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp"}/company/login`;

  try {
    const lines = [
      `${trimmedName} 様`,
      "",
      `${company.name} の求人ちゃんねるアカウントが発行されました。`,
      "",
      `ログインURL: ${loginUrl}`,
      `メールアドレス: ${trimmedEmail}`,
      `初期パスワード: ${tempPassword}`,
      "",
      "ログイン後、必ずパスワードを変更してください。",
    ];
    await sendTransactionalEmail({
      to: trimmedEmail,
      subject: `【求人ちゃんねる】${company.name} アカウント発行のお知らせ`,
      text: lines.join("\n"),
      html: lines.map((l) => l || "<br/>").join("<br/>"),
    });
  } catch (err) {
    console.error("Failed to send invite email", err);
  }

  revalidatePath("/company/settings");
}

export async function removeCompanyMember(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") throw new Error("Unauthorized");

  const company = await getCompanyForUser(session.user.id);

  const member = await prisma.user.findFirst({
    where: { id: targetUserId, companyId: company.id },
    select: { id: true },
  });
  if (!member) throw new Error("対象のメンバーが見つかりません");

  const count = await prisma.user.count({ where: { companyId: company.id, isActive: true } });
  if (count <= 1) {
    throw new Error("最後の1アカウントは削除できません。退会する場合はアカウント削除を行ってください。");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isActive: false,
      deletedAt: new Date(),
      companyId: null,
      email: `removed_${targetUserId}@deleted.invalid`,
      password: null,
    },
  });

  revalidatePath("/company/settings");
}
