"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveBasicInfo(data: {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  gender: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  cityTown: string;
  addressLine: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const birth = data.birthDate ? new Date(data.birthDate) : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      lastName: data.lastName.trim() || null,
      firstName: data.firstName.trim() || null,
      lastNameKana: data.lastNameKana.trim() || null,
      firstNameKana: data.firstNameKana.trim() || null,
      birthDate: birth && !Number.isNaN(birth.getTime()) ? birth : null,
      gender: data.gender.trim() || null,
      phone: data.phone.trim() || null,
      postalCode: data.postalCode.trim() || null,
      prefecture: data.prefecture.trim() || null,
      cityTown: data.cityTown.trim() || null,
      addressLine: data.addressLine.trim() || null,
      name: `${data.lastName.trim()} ${data.firstName.trim()}`.trim() || undefined,
    },
  });

  revalidatePath("/mypage");
  revalidatePath("/mypage/edit");
  revalidatePath("/mypage/resume-builder");
}
