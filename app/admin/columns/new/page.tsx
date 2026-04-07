import { createColumnPost } from "@/app/actions/admin/columns";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { ColumnForm } from "../column-form";

export default async function AdminColumnNewPage() {
  await requireColumnEditor();

  return (
    <ColumnForm
      title="コラム新規作成"
      submitLabel="作成する"
      action={createColumnPost}
    />
  );
}
