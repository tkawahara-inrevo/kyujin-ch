"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function blockUser(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "ログインが必要です" };
  if (targetUserId === session.user.id) return { ok: false, error: "自分自身はブロックできません" };

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
  if (!target) return { ok: false, error: "対象ユーザーが見つかりません" };

  try {
    await prisma.block.create({ data: { blockerId: session.user.id, blockedId: targetUserId } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return { ok: false, error: "既にブロック済みです" };
    }
    throw e;
  }

  revalidatePath("/mypage/blocks");
  revalidatePath("/messages");
  return { ok: true };
}

export async function unblockUser(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "ログインが必要です" };

  await prisma.block.deleteMany({
    where: { blockerId: session.user.id, blockedId: targetUserId },
  });
  revalidatePath("/mypage/blocks");
  revalidatePath("/messages");
  return { ok: true };
}

/**
 * 2人のユーザー間でブロックが存在するか（双方向）。
 * メッセージ送信前の判定に使用。
 */
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  });
  return !!block;
}
