import { notFound } from "next/navigation";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { updateColumnTemplate } from "@/app/actions/admin/columns";
import { TemplateForm } from "../../template-form";

type Params = Promise<{ id: string }>;

export default async function EditColumnTemplatePage({ params }: { params: Params }) {
  await requireColumnEditor();
  const { id } = await params;
  const template = await prisma.columnTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  return (
    <TemplateForm
      title="テンプレート編集"
      action={updateColumnTemplate.bind(null, id)}
      values={{ name: template.name, body: template.body }}
    />
  );
}
