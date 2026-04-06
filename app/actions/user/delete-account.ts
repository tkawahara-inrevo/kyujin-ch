"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { signOut } from "@/auth";

export async function deleteAccount() {
  const user = await getCurrentUser();

  if (user.role !== "USER") {
    throw new Error("求職者アカウントのみ退会できます");
  }

  const now = new Date();
  const anonymizedEmail = `deleted_${user.id}@deleted.invalid`;
  const anonymizedName = "退会済みユーザー";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletedAt: now,
      name: anonymizedName,
      email: anonymizedEmail,
      phone: null,
      resumeUrl: null,
      careerHistoryUrl: null,
      image: null,
      notificationsEnabled: false, // メール通知を止める
    },
  });

  await signOut({ redirectTo: "/" });
}
