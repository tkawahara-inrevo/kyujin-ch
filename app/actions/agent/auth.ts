"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAgentSession, clearAgentSession } from "@/lib/agent-session";
import { redirect } from "next/navigation";

export async function agentLogin(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  if (!email || !password) return { ok: false, error: "メールアドレスとパスワードを入力してください" } as const;

  const agent = await prisma.agent.findUnique({ where: { email } });
  if (!agent || !agent.isActive) return { ok: false, error: "メールアドレスまたはパスワードが正しくありません" } as const;

  const ok = await bcrypt.compare(password, agent.password);
  if (!ok) return { ok: false, error: "メールアドレスまたはパスワードが正しくありません" } as const;

  await createAgentSession({ id: agent.id, email: agent.email, name: agent.name });
  return { ok: true } as const;
}

export async function agentLogout() {
  await clearAgentSession();
  redirect("/agent/login");
}

export async function updateAgentPassword(currentPassword: string, newPassword: string) {
  const { getAgentSession } = await import("@/lib/agent-session");
  const session = await getAgentSession();
  if (!session) throw new Error("Unauthorized");

  const agent = await prisma.agent.findUnique({ where: { id: session.agentId } });
  if (!agent) throw new Error("Not found");

  const ok = await bcrypt.compare(currentPassword, agent.password);
  if (!ok) throw new Error("現在のパスワードが正しくありません");

  if (newPassword.length < 8) throw new Error("新しいパスワードは8文字以上にしてください");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.agent.update({ where: { id: agent.id }, data: { password: hashed } });
}
