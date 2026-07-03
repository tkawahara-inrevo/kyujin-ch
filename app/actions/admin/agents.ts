"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { postToSlack } from "@/lib/slack";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }
  return session;
}

function generateTemporaryPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function createAgent(data: {
  name: string;
  email: string;
  contactName?: string;
  phone?: string;
}) {
  await requireAdmin();

  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const contactName = data.contactName?.trim() || null;
  const phone = data.phone?.trim() || null;

  if (!name) throw new Error("代理店名を入力してください");
  if (!email) throw new Error("メールアドレスを入力してください");

  const existing = await prisma.agent.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("そのメールアドレスは既に登録されています");

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const agent = await prisma.agent.create({
    data: {
      name,
      email,
      password: hashedPassword,
      contactName,
      phone,
    },
  });

  const loginUrl = `${process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp"}/agent/login`;

  // アカウント発行メール
  let emailError: string | null = null;
  try {
    await sendTransactionalEmail({
      to: email,
      subject: "【求人ちゃんねる】代理店アカウントが発行されました",
      html: `
<p>${name} 様</p>
<p>この度は求人ちゃんねるの代理店パートナーにご登録いただきありがとうございます。</p>
<p>代理店専用の管理画面アカウントを発行いたしました。<br>
以下の情報でログインしてください。</p>
<br>
<p>【ログイン情報】</p>
<p>ログインURL: <a href="${loginUrl}">${loginUrl}</a><br>
メールアドレス: ${email}<br>
仮パスワード: ${temporaryPassword}</p>
<br>
<p>初回ログイン後、パスワードを変更してください。</p>
<br>
<p>求人ちゃんねる 運営事務局</p>
      `.trim(),
      text: `${name} 様\n\nこの度は求人ちゃんねるの代理店パートナーにご登録いただきありがとうございます。\n\n代理店専用の管理画面アカウントを発行いたしました。\n\n【ログイン情報】\nログインURL: ${loginUrl}\nメールアドレス: ${email}\n仮パスワード: ${temporaryPassword}\n\n初回ログイン後、パスワードを変更してください。\n\n求人ちゃんねる 運営事務局`,
      senderTag: "admin-issue-agent",
    });
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
    console.error("[admin-agents] メール送信失敗:", emailError, "宛先:", email);
  }

  await postToSlack(
    `以下の代理店アカウントを発行しました\n---\n代理店名: ${name}\nメール: ${email}\n担当者: ${contactName ?? "-"}\n---` +
      (emailError ? `\n⚠️ メール送信失敗: ${emailError}` : ""),
  );

  revalidatePath("/admin/agents");
  return { agentId: agent.id, temporaryPassword };
}

export async function updateAgent(
  id: string,
  data: { name: string; email: string; contactName?: string; phone?: string; isActive: boolean },
) {
  await requireAdmin();
  const email = data.email.trim().toLowerCase();

  // メールアドレス重複チェック (自分以外)
  const existing = await prisma.agent.findFirst({
    where: { email, id: { not: id } },
    select: { id: true },
  });
  if (existing) throw new Error("そのメールアドレスは既に他の代理店で使われています");

  await prisma.agent.update({
    where: { id },
    data: {
      name: data.name.trim(),
      email,
      contactName: data.contactName?.trim() || null,
      phone: data.phone?.trim() || null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/agents");
  revalidatePath(`/admin/agents/${id}`);
}

export async function resetAgentPassword(id: string) {
  await requireAdmin();
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) throw new Error("代理店が見つかりません");

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  await prisma.agent.update({ where: { id }, data: { password: hashedPassword } });

  const loginUrl = `${process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp"}/agent/login`;

  try {
    await sendTransactionalEmail({
      to: agent.email,
      subject: "【求人ちゃんねる】代理店パスワードを再発行しました",
      html: `<p>${agent.name} 様</p><p>代理店アカウントのパスワードを再発行しました。</p><p>ログインURL: <a href="${loginUrl}">${loginUrl}</a><br>仮パスワード: ${temporaryPassword}</p><p>初回ログイン後、パスワードを変更してください。</p><p>求人ちゃんねる 運営事務局</p>`,
      text: `${agent.name} 様\n\nパスワードを再発行しました。\n\nログインURL: ${loginUrl}\n仮パスワード: ${temporaryPassword}\n\n求人ちゃんねる 運営事務局`,
      senderTag: "admin-agent-password-reset",
    });
  } catch (err) {
    console.error("[admin-agents] 再発行メール失敗:", err);
  }

  return { temporaryPassword };
}

export async function assignAgentToCompany(companyId: string, agentId: string | null) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { agentId },
  });
  revalidatePath(`/admin/companies/${companyId}`);
  if (agentId) revalidatePath(`/admin/agents/${agentId}`);
}
