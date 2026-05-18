"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseFormData(formData: FormData) {
  const tags = (formData.get("tags") as string ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug: (formData.get("slug") as string).trim(),
    companyName: (formData.get("companyName") as string).trim(),
    title: (formData.get("title") as string).trim(),
    summary: (formData.get("summary") as string)?.trim() || null,
    body: (formData.get("body") as string).trim(),
    thumbnailUrl: (formData.get("thumbnailUrl") as string)?.trim() || null,
    tags,
    isPublished: formData.get("isPublished") === "on",
    isHot: formData.get("isHot") === "on",
    publishedAt: formData.get("isPublished") === "on" ? new Date() : null,
    authorName: (formData.get("authorName") as string)?.trim() || null,
    authorBio: (formData.get("authorBio") as string)?.trim() || null,
    authorImageUrl: (formData.get("authorImageUrl") as string)?.trim() || null,
  };
}

export async function createFocusArticle(formData: FormData) {
  await requireAdmin();
  const data = parseFormData(formData);

  await prisma.focusArticle.create({ data });

  revalidatePath("/focus");
  revalidatePath("/admin/focus");
  redirect("/admin/focus");
}

export async function updateFocusArticle(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseFormData(formData);

  // 公開日: 既に公開済みなら維持、新たに公開するなら今日
  const existing = await prisma.focusArticle.findUnique({ where: { id }, select: { publishedAt: true, isPublished: true } });
  const publishedAt = data.isPublished
    ? (existing?.publishedAt ?? new Date())
    : null;

  await prisma.focusArticle.update({
    where: { id },
    data: { ...data, publishedAt },
  });

  revalidatePath("/focus");
  revalidatePath(`/focus/${data.slug}`);
  revalidatePath("/admin/focus");
  redirect("/admin/focus");
}

export async function deleteFocusArticle(id: string) {
  await requireAdmin();
  const article = await prisma.focusArticle.findUnique({ where: { id }, select: { slug: true } });
  await prisma.focusArticle.delete({ where: { id } });

  revalidatePath("/focus");
  if (article) revalidatePath(`/focus/${article.slug}`);
  revalidatePath("/admin/focus");
}
