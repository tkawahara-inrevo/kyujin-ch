import { buildTemplateXlsx } from "@/lib/job-xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const buffer = await buildTemplateXlsx();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="job_import_template.xlsx"`,
    },
  });
}
