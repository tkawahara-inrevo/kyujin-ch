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

export async function inviteCompanyMember(email: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") return { ok: false, error: "Unauthorized" };

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: "正しいメールアドレスを入力してください" };
  }
  if (!trimmedName) return { ok: false, error: "名前を入力してください" };

  const exists = await prisma.user.findUnique({ where: { email: trimmedEmail }, select: { id: true } });
  if (exists) return { ok: false, error: "このメールアドレスは既に使用されています" };

  let company;
  try {
    company = await getCompanyForUser(session.user.id);
  } catch {
    return { ok: false, error: "企業情報が見つかりません" };
  }
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
  return { ok: true } as const;
}

export async function removeCompanyMember(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") return { ok: false, error: "Unauthorized" };

  let company;
  try {
    company = await getCompanyForUser(session.user.id);
  } catch {
    return { ok: false, error: "企業情報が見つかりません" };
  }

  const member = await prisma.user.findFirst({
    where: { id: targetUserId, companyId: company.id },
    select: { id: true },
  });
  if (!member) return { ok: false, error: "対象のメンバーが見つかりません" };

  const count = await prisma.user.count({ where: { companyId: company.id, isActive: true } });
  if (count <= 1) {
    return { ok: false, error: "最後の1アカウントは削除できません。退会する場合はアカウント削除を行ってください。" };
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
  return { ok: true } as const;
}
