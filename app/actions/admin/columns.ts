"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

export async function createColumnPost(formData: FormData) {
  const session = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const isPublished = parseCheckbox(formData.get("isPublished"));

  if (!title) throw new Error("タイトルは必須です");
  if (!body) throw new Error("本文は必須です");

  await prisma.columnPost.create({
    data: {
      title,
      summary: summary || null,
      body,
      thumbnailUrl: thumbnailUrl || null,
      tags,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      authorId: session.user.id,
    },
  });

  revalidatePath("/column");
  revalidatePath("/admin/columns");
  redirect("/admin/columns");
}

export async function updateColumnPost(id: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const isPublished = parseCheckbox(formData.get("isPublished"));

  if (!title) throw new Error("タイトルは必須です");
  if (!body) throw new Error("本文は必須です");

  const current = await prisma.columnPost.findUnique({
    where: { id },
    select: { isPublished: true, publishedAt: true },
  });
  if (!current) throw new Error("コラム記事が見つかりません");

  await prisma.columnPost.update({
    where: { id },
    data: {
      title,
      summary: summary || null,
      body,
      thumbnailUrl: thumbnailUrl || null,
      tags,
      isPublished,
      publishedAt: isPublished
        ? current.publishedAt ?? new Date()
        : null,
    },
  });

  revalidatePath("/column");
  revalidatePath(`/column/${id}`);
  revalidatePath("/admin/columns");
  revalidatePath(`/admin/columns/${id}/edit`);
  redirect("/admin/columns");
}

export async function deleteColumnPost(id: string) {
  await requireAdmin();
  await prisma.columnPost.delete({ where: { id } });
  revalidatePath("/column");
  revalidatePath(`/column/${id}`);
  revalidatePath("/admin/columns");
}

export async function toggleColumnPublished(id: string) {
  await requireAdmin();
  const post = await prisma.columnPost.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!post) throw new Error("コラム記事が見つかりません");

  const nextPublished = !post.isPublished;
  await prisma.columnPost.update({
    where: { id },
    data: {
      isPublished: nextPublished,
      publishedAt: nextPublished ? new Date() : null,
    },
  });

  revalidatePath("/column");
  revalidatePath(`/column/${id}`);
  revalidatePath("/admin/columns");
}
