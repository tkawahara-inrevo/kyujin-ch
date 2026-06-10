import { notFound } from "next/navigation";
import { updateBizColumnPost } from "@/app/actions/admin/biz-columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ColumnForm } from "../../../columns/column-form";

type Params = Promise<{ id: string }>;

export default async function AdminBizColumnEditPage({ params }: { params: Params }) {
  await requireColumnEditor();
  const { id } = await params;

  const [post, templates] = await Promise.all([
    prisma.bizColumnPost.findUnique({ where: { id } }),
    prisma.columnTemplate.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (!post) notFound();

  return (
    <ColumnForm
      title="toBコラム編集"
      action={updateBizColumnPost.bind(null, id)}
      templates={templates}
      values={{
        slug: post.slug,
        title: post.title,
        summary: post.summary ?? "",
        body: post.body,
        thumbnailUrl: post.thumbnailUrl ?? "",
        tags: post.tags.join(", "),
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
        metaTitle: post.metaTitle ?? null,
        metaDescription: post.metaDescription ?? null,
      }}
    />
  );
}
