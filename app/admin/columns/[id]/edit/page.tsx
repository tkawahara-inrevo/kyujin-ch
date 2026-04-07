import { notFound } from "next/navigation";
import { updateColumnPost } from "@/app/actions/admin/columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ColumnForm } from "../../column-form";

type Params = Promise<{ id: string }>;

export default async function AdminColumnEditPage({
  params,
}: {
  params: Params;
}) {
  await requireColumnEditor();
  const { id } = await params;

  const post = await prisma.columnPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <ColumnForm
      title="コラム編集"
      submitLabel="更新する"
      action={updateColumnPost.bind(null, id)}
      values={{
        title: post.title,
        summary: post.summary ?? "",
        body: post.body,
        thumbnailUrl: post.thumbnailUrl ?? "",
        tags: post.tags.join(", "),
        isPublished: post.isPublished,
      }}
    />
  );
}
