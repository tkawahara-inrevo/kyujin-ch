"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) throw new Error("Unauthorized");
}

export async function approveInvalidRequest(requestId: string) {
  await requireAdmin();

  const req = await prisma.invalidRequest.findUnique({
    where: { id: requestId },
    include: { application: true },
  });
  if (!req) throw new Error("Not found");

  await prisma.$transaction([
    prisma.invalidRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    prisma.charge.updateMany({
      where: { applicationId: req.applicationId },
      data: { isValid: false },
    }),
  ]);

  revalidatePath("/admin/invalid-requests");
}

export async function rejectInvalidRequest(requestId: string) {
  await requireAdmin();

  await prisma.invalidRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/invalid-requests");
}
