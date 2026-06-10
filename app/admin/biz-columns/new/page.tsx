import { createBizColumnPost } from "@/app/actions/admin/biz-columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ColumnForm } from "../../columns/column-form";

export default async function AdminBizColumnNewPage() {
  await requireColumnEditor();
  const templates = await prisma.columnTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <ColumnForm
      title="toBコラム新規作成"
      action={createBizColumnPost}
      templates={templates}
    />
  );
}
