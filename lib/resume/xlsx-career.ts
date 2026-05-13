import ExcelJS from "exceljs";
import type { ResumeData } from "./types";
import { CAREER_JOB_TYPES } from "./types";

const THIN: ExcelJS.Border = { style: "thin", color: { argb: "FF333333" } };

function b() {
  return { top: THIN, left: THIN, bottom: THIN, right: THIN };
}

function formatPeriod(
  startYear: number,
  startMonth: number,
  endYear: number | null,
  endMonth: number | null,
  isCurrent: boolean
): string {
  const start = `${startYear}年${startMonth}月`;
  const end = isCurrent ? "現在" : endYear ? `${endYear}年${endMonth}月` : "";
  return end ? `${start} ～ ${end}` : start;
}

export async function generateCareerXlsx(data: ResumeData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("職務経歴書", {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });

  ws.getColumn(1).width = 12;
  ws.getColumn(2).width = 50;
  ws.getColumn(3).width = 18;

  let row = 1;

  // タイトル
  ws.mergeCells(`A${row}:C${row}`);
  const titleCell = ws.getCell(`A${row}`);
  titleCell.value = "職　務　経　歴　書";
  titleCell.font = { name: "游明朝", size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(row).height = 30;
  row++;

  // 日付・氏名
  ws.mergeCells(`A${row}:C${row}`);
  const today = new Date();
  const metaCell = ws.getCell(`A${row}`);
  metaCell.value = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日現在　　${data.lastName} ${data.firstName}`;
  metaCell.font = { name: "游明朝", size: 9 };
  metaCell.alignment = { horizontal: "right", vertical: "middle" };
  ws.getRow(row).height = 14;
  row++;

  const jobTypeLabel = CAREER_JOB_TYPES.find((t) => t.value === data.careerJobType)?.label ?? "一般職（汎用）";

  // 職種
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = `【対象職種】${jobTypeLabel}`;
  ws.getCell(`A${row}`).font = { name: "游明朝", size: 9 };
  ws.getCell(`A${row}`).alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(row).height = 14;
  row++;

  row++; // 空白

  const addSection = (title: string) => {
    ws.mergeCells(`A${row}:C${row}`);
    const sc = ws.getCell(`A${row}`);
    sc.value = `■ ${title}`;
    sc.font = { name: "游明朝", size: 10, bold: true, color: { argb: "FF1A56DB" } };
    sc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F0FE" } };
    sc.alignment = { vertical: "middle" };
    sc.border = b();
    ws.getRow(row).height = 18;
  };

  // 職務要約
  addSection("職務要約");
  row++;
  ws.mergeCells(`A${row}:C${row + 3}`);
  const summaryCell = ws.getCell(`A${row}`);
  summaryCell.value = data.prText || "";
  summaryCell.font = { name: "游明朝", size: 9 };
  summaryCell.alignment = { vertical: "top", wrapText: true };
  summaryCell.border = b();
  ws.getRow(row).height = 60;
  row += 4;

  row++; // 空白

  // 職務経歴
  addSection("職務経歴");
  row++;

  // テーブルヘッダー
  const headers = ["会社名 / 部署・役職", "業務内容", "在籍期間"];
  const widths = ["A", "B", "C"];
  headers.forEach((h, i) => {
    const c = ws.getCell(`${widths[i]}${row}`);
    c.value = h;
    c.font = { name: "游明朝", size: 8, bold: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = b();
  });
  ws.getRow(row).height = 16;
  row++;

  for (const w of data.workExperiences) {
    const companyText = `${w.companyName}${w.department ? `\n${w.department}` : ""}`;
    const periodText = formatPeriod(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent);
    const lines = (w.description || "").split(/\r?\n/).filter(Boolean).map((l) => `・${l.replace(/^[・●▶\-\s]+/, "")}`).join("\n");

    ws.getCell(`A${row}`).value = companyText;
    ws.getCell(`A${row}`).font = { name: "游明朝", size: 9 };
    ws.getCell(`A${row}`).alignment = { vertical: "top", wrapText: true };
    ws.getCell(`A${row}`).border = b();

    ws.getCell(`B${row}`).value = lines;
    ws.getCell(`B${row}`).font = { name: "游明朝", size: 9 };
    ws.getCell(`B${row}`).alignment = { vertical: "top", wrapText: true };
    ws.getCell(`B${row}`).border = b();

    ws.getCell(`C${row}`).value = periodText;
    ws.getCell(`C${row}`).font = { name: "游明朝", size: 8 };
    ws.getCell(`C${row}`).alignment = { vertical: "top", wrapText: true };
    ws.getCell(`C${row}`).border = b();

    const descLines = (w.description || "").split("\n").length;
    ws.getRow(row).height = Math.max(40, descLines * 14);
    row++;
  }

  row++;

  // ITエンジニア向け: スキルシート追加
  if (data.careerJobType === "it_engineer") {
    addSection("スキルシート（技術）");
    row++;
    ws.mergeCells(`A${row}:C${row}`);
    ws.getCell(`A${row}`).value = "※ 以下に使用技術・ツール・資格等を追記してください";
    ws.getCell(`A${row}`).font = { name: "游明朝", size: 8, color: { argb: "FF888888" } };
    ws.getCell(`A${row}`).border = b();
    ws.getRow(row).height = 14;
    row++;
    for (let i = 0; i < 6; i++) {
      ws.mergeCells(`A${row}:C${row}`);
      ws.getCell(`A${row}`).border = b();
      ws.getRow(row).height = 14;
      row++;
    }
    row++;
  }

  // 資格・免許
  if (data.certifications.length > 0) {
    addSection("資格・免許");
    row++;
    for (const c of data.certifications) {
      ws.getCell(`A${row}`).value = `${c.year}年${c.month}月`;
      ws.getCell(`A${row}`).font = { name: "游明朝", size: 9 };
      ws.getCell(`A${row}`).border = b();

      ws.mergeCells(`B${row}:C${row}`);
      ws.getCell(`B${row}`).value = `${c.name}　取得`;
      ws.getCell(`B${row}`).font = { name: "游明朝", size: 9 };
      ws.getCell(`B${row}`).border = b();
      ws.getRow(row).height = 14;
      row++;
    }
    row++;
  }

  // 自己PR
  addSection("自己PR");
  row++;
  ws.mergeCells(`A${row}:C${row + 4}`);
  const prCell = ws.getCell(`A${row}`);
  prCell.value = data.prText || "";
  prCell.font = { name: "游明朝", size: 9 };
  prCell.alignment = { vertical: "top", wrapText: true };
  prCell.border = b();
  ws.getRow(row).height = 80;

  return Buffer.from(await wb.xlsx.writeBuffer());
}
