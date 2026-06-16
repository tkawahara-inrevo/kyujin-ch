"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = new Set(["job", "company", "user", "message"]);

export async function submitReport(input: {
  targetType: string;
  targetId: string;
  reason: string;
  detail?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "ログインが必要です" };
  if (!ALLOWED_TYPES.has(input.targetType)) {
    return { ok: false, error: "対象タイプが不正です" };
  }
  if (!input.targetId?.trim()) return { ok: false, error: "対象IDが不正です" };
  if (!input.reason?.trim()) return { ok: false, error: "理由を選択してください" };

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: input.targetType,
      targetId: input.targetId.trim(),
      reason: input.reason.trim(),
      detail: input.detail?.trim() || null,
    },
  });

  revalidatePath("/admin/reports");
  return { ok: true };
}
