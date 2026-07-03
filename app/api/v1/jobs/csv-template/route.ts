import { buildTemplateCsv } from "@/lib/job-csv";

export const dynamic = "force-dynamic";

/** テンプレート CSV を返す (BOM 付き UTF-8 で Excel でも文字化けしない) */
export async function GET() {
  const csv = buildTemplateCsv();
  const bom = "﻿";
  const body = bom + csv;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="job_import_template.csv"`,
    },
  });
}
