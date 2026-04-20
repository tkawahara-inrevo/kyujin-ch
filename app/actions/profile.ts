"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();

  const lastName      = (formData.get("lastName")      as string | null)?.trim() ?? "";
  const firstName     = (formData.get("firstName")     as string | null)?.trim() ?? "";
  const lastNameKana  = (formData.get("lastNameKana")  as string | null)?.trim() ?? "";
  const firstNameKana = (formData.get("firstNameKana") as string | null)?.trim() ?? "";
  const birthDateRaw  = (formData.get("birthDate")     as string | null)?.trim();
  const gender        = (formData.get("gender")        as string | null)?.trim() ?? "";
  const email         = (formData.get("email")         as string | null)?.trim() ?? "";
  const phone         = (formData.get("phone")         as string | null)?.trim() ?? "";
  const postalCode    = (formData.get("postalCode")    as string | null)?.trim() ?? "";
  const prefecture    = (formData.get("prefecture")    as string | null)?.trim() ?? "";
  const cityTown      = (formData.get("cityTown")      as string | null)?.trim() ?? "";
  const addressLine   = (formData.get("addressLine")   as string | null)?.trim() ?? "";
  const notificationsEnabled = formData.get("notificationsEnabled") === "true";

  const name = [lastName, firstName].filter(Boolean).join(" ") || user.name;
  const birthDate = birthDateRaw ? new Date(birthDateRaw) : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      lastName:      lastName      || null,
      firstName:     firstName     || null,
      lastNameKana:  lastNameKana  || null,
      firstNameKana: firstNameKana || null,
      birthDate:     birthDate     ?? undefined,
      gender:        gender        || null,
      email,
      phone:         phone         || null,
      postalCode:    postalCode    || null,
      prefecture:    prefecture    || null,
      cityTown:      cityTown      || null,
      addressLine:   addressLine   || null,
      notificationsEnabled,
    },
  });

  revalidatePath("/mypage");
  redirect("/mypage");
}
