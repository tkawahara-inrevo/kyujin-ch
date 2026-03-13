import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const companyPw = await bcrypt.hash("test1234", 10);

  const result = await prisma.user.updateMany({
    where: { role: "COMPANY" },
    data: { password: companyPw },
  });

  return NextResponse.json({
    updated: result.count,
    password: "test1234",
  });
}
