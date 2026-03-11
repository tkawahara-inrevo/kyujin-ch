"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();

  const name = (formData.get("name") as string | null) ?? "";
  const email = (formData.get("email") as string | null) ?? "";
  const phone = (formData.get("phone") as string | null) ?? "";
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email, phone, notificationsEnabled },
  });

  revalidatePath("/mypage");
  redirect("/mypage");
}
