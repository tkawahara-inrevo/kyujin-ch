import { requireColumnEditor } from "@/lib/auth-helpers";
import { createColumnTemplate } from "@/app/actions/admin/columns";
import { TemplateForm } from "../template-form";

export default async function NewColumnTemplatePage() {
  await requireColumnEditor();
  return <TemplateForm title="テンプレート新規作成" action={createColumnTemplate} />;
}
