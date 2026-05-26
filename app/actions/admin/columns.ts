"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function parseTags(raw: string) {
  return raw.split(",").map((tag) => tag.trim()).filter(Boolean);
}

const SLUG_RE = /^[a-z0-9_\-]+$/;

type ColumnStatus = "draft" | "published" | "scheduled";

function buildPublishData(status: ColumnStatus, scheduledAt: string | null, currentPublishedAt: Date | null | undefined) {
  if (status === "draft") return { isPublished: false, publishedAt: null };
  if (status === "scheduled" && scheduledAt) return { isPublished: true, publishedAt: new Date(scheduledAt) };
  return { isPublished: true, publishedAt: currentPublishedAt ?? new Date() };
}

export async function createColumnPost(formData: FormData) {
  const session = await requireColumnEditor() as { user: { id: string } };
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const status = (formData.get("status") as ColumnStatus) ?? "draft";
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim() || null;
  if (!slug) throw new Error("スラッグは必須です");
  if (!SLUG_RE.test(slug)) throw new Error("スラッグは半角英数字・ハイフン・アンダースコアのみ使用できます");
  if (!title) throw new Error("タイトルは必須です");
  if (!body) throw new Error("本文は必須です");
  const exists = await prisma.columnPost.findUnique({ where: { slug }, select: { id: true } });
  if (exists) throw new Error(`スラッグ「${slug}」は既に使われています`);
  await prisma.columnPost.create({
    data: {
      slug, title, summary: summary || null, body,
      thumbnailUrl: thumbnailUrl || null, tags, metaTitle, metaDescription,
      ...buildPublishData(status, scheduledAt, null),
      authorId: session.user.id,
    },
  });
  revalidatePath("/column");
  revalidatePath("/admin/columns");
  redirect("/admin/columns");
}

export async function updateColumnPost(id: string, formData: FormData) {
  await requireColumnEditor();
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const status = (formData.get("status") as ColumnStatus) ?? "draft";
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim() || null;
  if (!slug) throw new Error("スラッグは必須です");
  if (!SLUG_RE.test(slug)) throw new Error("スラッグは半角英数字・ハイフン・アンダースコアのみ使用できます");
  if (!title) throw new Error("タイトルは必須です");
  if (!body) throw new Error("本文は必須です");
  const current = await prisma.columnPost.findUnique({ where: { id }, select: { publishedAt: true, slug: true } });
  if (!current) throw new Error("コラム記事が見つかりません");
  if (slug !== current.slug) {
    const dup = await prisma.columnPost.findUnique({ where: { slug }, select: { id: true } });
    if (dup) throw new Error(`スラッグ「${slug}」は既に使われています`);
  }
  await prisma.columnPost.update({
    where: { id },
    data: {
      slug, title, summary: summary || null, body,
      thumbnailUrl: thumbnailUrl || null, tags, metaTitle, metaDescription,
      ...buildPublishData(status, scheduledAt, current.publishedAt),
    },
  });
  revalidatePath("/column");
  revalidatePath(`/column/${slug}`);
  revalidatePath("/admin/columns");
  revalidatePath(`/admin/columns/${id}/edit`);
  redirect("/admin/columns");
}

export async function deleteColumnPost(id: string) {
  await requireColumnEditor();
  await prisma.columnPost.delete({ where: { id } });
  revalidatePath("/column");
  revalidatePath("/admin/columns");
}

export async function toggleColumnPublished(id: string) {
  await requireColumnEditor();
  const post = await prisma.columnPost.findUnique({ where: { id }, select: { isPublished: true, slug: true } });
  if (!post) throw new Error("コラム記事が見つかりません");
  const nextPublished = !post.isPublished;
  await prisma.columnPost.update({
    where: { id },
    data: { isPublished: nextPublished, publishedAt: nextPublished ? new Date() : null },
  });
  revalidatePath("/column");
  revalidatePath(`/column/${post.slug}`);
  revalidatePath("/admin/columns");
}

// ── テンプレート ─────────────────────────────────────────────────

export async function createColumnTemplate(formData: FormData) {
  await requireColumnEditor();
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!name) throw new Error("テンプレート名は必須です");
  if (!body) throw new Error("本文は必須です");
  await prisma.columnTemplate.create({ data: { name, body } });
  revalidatePath("/admin/columns/templates");
  redirect("/admin/columns/templates");
}

export async function updateColumnTemplate(id: string, formData: FormData) {
  await requireColumnEditor();
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!name) throw new Error("テンプレート名は必須です");
  await prisma.columnTemplate.update({ where: { id }, data: { name, body } });
  revalidatePath("/admin/columns/templates");
  redirect("/admin/columns/templates");
}

export async function deleteColumnTemplate(id: string) {
  await requireColumnEditor();
  await prisma.columnTemplate.delete({ where: { id } });
  revalidatePath("/admin/columns/templates");
}
