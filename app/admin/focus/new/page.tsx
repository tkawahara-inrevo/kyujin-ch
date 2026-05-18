import { requireAdmin } from "@/lib/auth-helpers";
import { createFocusArticle } from "@/app/actions/admin/focus";
import { FocusForm } from "../focus-form";

export default async function AdminFocusNewPage() {
  await requireAdmin();

  return (
    <FocusForm
      title="Focus 新規記事作成"
      submitLabel="作成する"
      action={createFocusArticle}
    />
  );
}
