"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { revalidatePath } from "next/cache";

export async function submitReview(
  companyId: string,
  formData: FormData
) {
  const user = await getCurrentUser();

  const rating = parseInt(formData.get("rating") as string, 10);
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  if (!title || !body || !rating) {
    return { error: "すべての項目を入力してください" };
  }

  await prisma.review.upsert({
    where: { userId_companyId: { userId: user.id, companyId } },
    update: { rating, title, body },
    create: { userId: user.id, companyId, rating, title, body },
  });

  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/mypage");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const user = await getCurrentUser();

  await prisma.review.deleteMany({
    where: { id: reviewId, userId: user.id },
  });

  revalidatePath("/mypage");
  return { success: true };
}
