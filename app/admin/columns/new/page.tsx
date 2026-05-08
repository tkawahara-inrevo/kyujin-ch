import { createColumnPost } from "@/app/actions/admin/columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ColumnForm } from "../column-form";

export default async function AdminColumnNewPage() {
  await requireColumnEditor();
  const templates = await prisma.columnTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <ColumnForm
      title="コラム新規作成"
      action={createColumnPost}
      templates={templates}
    />
  );
}
