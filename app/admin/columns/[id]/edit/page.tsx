import { notFound } from "next/navigation";
import { updateColumnPost } from "@/app/actions/admin/columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ColumnForm } from "../../column-form";

type Params = Promise<{ id: string }>;

export default async function AdminColumnEditPage({ params }: { params: Params }) {
  await requireColumnEditor();
  const { id } = await params;

  const [post, templates] = await Promise.all([
    prisma.columnPost.findUnique({ where: { id } }),
    prisma.columnTemplate.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (!post) notFound();

  return (
    <ColumnForm
      title="コラム編集"
      action={updateColumnPost.bind(null, id)}
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
        metaTitle: (post as { metaTitle?: string | null }).metaTitle ?? null,
        metaDescription: (post as { metaDescription?: string | null }).metaDescription ?? null,
      }}
    />
  );
}
