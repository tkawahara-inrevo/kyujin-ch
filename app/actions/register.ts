"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerUser(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "すべての項目を入力してください" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上にしてください" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に使用されています" };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, phone, password: hashed },
  });

  return { success: true };
}
