"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAgentSession } from "@/lib/agent-session";
import { JOB_CSV_COLUMNS, parseJobCsvRow, type ParsedJobRow } from "@/lib/job-csv";
import { parseCsv } from "@/lib/csv";
import { revalidatePath } from "next/cache";

export type CsvImportResult = {
  ok: boolean;
  successCount: number;
  errorRows: { rowNumber: number; errors: string[]; titleGuess?: string }[];
  createdJobIds: string[];
  totalRows: number;
};

async function resolveCompanyContext(companyId: string): Promise<{ companyId: string; actorLabel: string } | null> {
  // 1. 企業ログイン中?
  const session = await auth();
  if (session?.user?.id && session.user.role === "COMPANY") {
    const company = await prisma.company.findFirst({
      where: { users: { some: { id: session.user.id } }, id: companyId },
      select: { id: true, name: true },
    });
    if (company) return { companyId: company.id, actorLabel: `企業 (${company.name})` };
  }

  // 2. 代理店ログイン中?
  const agent = await getAgentSession();
  if (agent) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, agentId: agent.agentId },
      select: { id: true, name: true },
    });
    if (company) return { companyId: company.id, actorLabel: `代理店 (${agent.name}) → ${company.name}` };
  }

  return null;
}

/** CSV テキストから求人を一括作成 (DRAFT 状態) */
export async function importJobsFromCsv(
  csvText: string,
  companyId: string,
): Promise<CsvImportResult> {
  const ctx = await resolveCompanyContext(companyId);
  if (!ctx) throw new Error("この企業に対する権限がありません");

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { ok: false, successCount: 0, errorRows: [], createdJobIds: [], totalRows: 0 };
  }

  const header = rows[0].map((h) => h.trim());
  // ヘッダーからカラムキー配列を作る (ラベル → key マッピング)
  const labelToKey: Record<string, string> = {};
  for (const col of JOB_CSV_COLUMNS) {
    labelToKey[col.label] = col.key;
  }
  const columnKeys = header.map((label) => labelToKey[label] ?? null);

  // データ行は 2 行目以降
  // 2 行目は「ヒント/説明行」の可能性が高い → データっぽく無い場合はスキップ
  const dataRows = rows.slice(1).filter((row, idx) => {
    if (idx === 0) {
      // 説明行スキップ判定: 「必須」「任意」等のキーワードがあれば説明行と判断
      const joined = row.join("").trim();
      if (joined.includes("必須") || joined.includes("例:") || joined.includes("任意")) {
        return false;
      }
    }
    return row.some((cell) => cell.trim());
  });

  const parsed: { rowNumber: number; result: ReturnType<typeof parseJobCsvRow>; titleGuess?: string }[] = [];
  dataRows.forEach((row, idx) => {
    const record: Record<string, string> = {};
    row.forEach((cell, colIdx) => {
      const key = columnKeys[colIdx];
      if (key) record[key] = cell;
    });
    parsed.push({
      rowNumber: idx + 2, // 1-indexed, ヘッダー行を +1
      result: parseJobCsvRow(record),
      titleGuess: record.title,
    });
  });

  const successRows = parsed.filter((p) => p.result.ok);
  const errorRows = parsed
    .filter((p) => !p.result.ok)
    .map((p) => ({ rowNumber: p.rowNumber, errors: p.result.errors, titleGuess: p.titleGuess }));

  const createdJobIds: string[] = [];

  for (const p of successRows) {
    const data = p.result.data!;
    try {
      const job = await prisma.job.create({
        data: {
          companyId: ctx.companyId,
          title: data.title,
          description: data.description,
          location: data.location,
          region: data.region,
          categoryTag: data.categoryTag,
          jobSubcategory: data.jobSubcategory,
          employmentType: data.employmentType as never,
          targetType: data.targetType,
          salaryType: data.salaryType,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          requirements: data.requirements,
          workingHours: data.workingHours,
          tags: data.tags,
          reviewStatus: "DRAFT",
          isPublished: false,
        },
      });
      createdJobIds.push(job.id);
    } catch (e) {
      errorRows.push({
        rowNumber: p.rowNumber,
        errors: [`DB 登録失敗: ${e instanceof Error ? e.message : String(e)}`],
        titleGuess: p.titleGuess,
      });
    }
  }

  revalidatePath("/company/jobs");
  revalidatePath("/admin/jobs");

  return {
    ok: errorRows.length === 0,
    successCount: createdJobIds.length,
    errorRows,
    createdJobIds,
    totalRows: parsed.length,
  };
}
