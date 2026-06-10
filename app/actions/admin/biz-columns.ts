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

export async function createBizColumnPost(formData: FormData) {
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
  const exists = await prisma.bizColumnPost.findUnique({ where: { slug }, select: { id: true } });
  if (exists) throw new Error(`スラッグ「${slug}」は既に使われています`);
  await prisma.bizColumnPost.create({
    data: {
      slug, title, summary: summary || null, body,
      thumbnailUrl: thumbnailUrl || null, tags, metaTitle, metaDescription,
      ...buildPublishData(status, scheduledAt, null),
      authorId: session.user.id,
    },
  });
  revalidatePath("/biz-column");
  revalidatePath("/admin/biz-columns");
  redirect("/admin/biz-columns");
}

export async function updateBizColumnPost(id: string, formData: FormData) {
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
  const current = await prisma.bizColumnPost.findUnique({ where: { id }, select: { publishedAt: true, slug: true } });
  if (!current) throw new Error("コラム記事が見つかりません");
  if (slug !== current.slug) {
    const dup = await prisma.bizColumnPost.findUnique({ where: { slug }, select: { id: true } });
    if (dup) throw new Error(`スラッグ「${slug}」は既に使われています`);
  }
  await prisma.bizColumnPost.update({
    where: { id },
    data: {
      slug, title, summary: summary || null, body,
      thumbnailUrl: thumbnailUrl || null, tags, metaTitle, metaDescription,
      ...buildPublishData(status, scheduledAt, current.publishedAt),
    },
  });
  revalidatePath("/biz-column");
  revalidatePath(`/biz-column/${slug}`);
  revalidatePath("/admin/biz-columns");
  redirect("/admin/biz-columns");
}

export async function deleteBizColumnPost(id: string) {
  await requireColumnEditor();
  await prisma.bizColumnPost.delete({ where: { id } });
  revalidatePath("/biz-column");
  revalidatePath("/admin/biz-columns");
}

export async function toggleBizColumnPublished(id: string) {
  await requireColumnEditor();
  const post = await prisma.bizColumnPost.findUnique({ where: { id }, select: { isPublished: true, slug: true } });
  if (!post) throw new Error("コラム記事が見つかりません");
  const nextPublished = !post.isPublished;
  await prisma.bizColumnPost.update({
    where: { id },
    data: { isPublished: nextPublished, publishedAt: nextPublished ? new Date() : null },
  });
  revalidatePath("/biz-column");
  revalidatePath(`/biz-column/${post.slug}`);
  revalidatePath("/admin/biz-columns");
}
