import ExcelJS from "exceljs";
import type { ResumeData } from "./types";

function calcAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

const THIN: ExcelJS.Border = { style: "thin", color: { argb: "FF333333" } };
const THICK: ExcelJS.Border = { style: "medium", color: { argb: "FF333333" } };

function border(top = THIN, left = THIN, bottom = THIN, right = THIN) {
  return { top, left, bottom, right };
}

export async function generateResumeXlsx(data: ResumeData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("履歴書", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
    },
  });

  // 列幅設定
  ws.getColumn(1).width = 5;   // 年
  ws.getColumn(2).width = 4;   // 月
  ws.getColumn(3).width = 40;  // 内容
  ws.getColumn(4).width = 5;   // 年（右）
  ws.getColumn(5).width = 4;   // 月（右）
  ws.getColumn(6).width = 40;  // 内容（右）

  let row = 1;

  // タイトル行
  ws.mergeCells(`A${row}:C${row}`);
  const titleCell = ws.getCell(`A${row}`);
  titleCell.value = "履　歴　書";
  titleCell.font = { name: "游明朝", size: 18, bold: true };
  titleCell.alignment = { vertical: "middle" };

  ws.mergeCells(`D${row}:F${row}`);
  const dateCell = ws.getCell(`D${row}`);
  const today = new Date();
  dateCell.value = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日現在`;
  dateCell.alignment = { horizontal: "right", vertical: "middle" };
  dateCell.font = { name: "游明朝", size: 9 };
  ws.getRow(row).height = 28;
  row++;

  // 氏名エリア
  const addLabelValue = (
    r: number,
    label: string,
    value: string,
    labelCols: string,
    valueCols: string,
    fontSize = 9,
    bold = false,
    height = 18
  ) => {
    ws.mergeCells(labelCols);
    const lc = ws.getCell(labelCols.split(":")[0]);
    lc.value = label;
    lc.font = { name: "游明朝", size: 8 };
    lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
    lc.alignment = { horizontal: "center", vertical: "middle" };
    lc.border = border();

    ws.mergeCells(valueCols);
    const vc = ws.getCell(valueCols.split(":")[0]);
    vc.value = value;
    vc.font = { name: "游明朝", size: fontSize, bold };
    vc.alignment = { vertical: "middle" };
    vc.border = border();
    ws.getRow(r).height = height;
  };

  // ふりがな
  addLabelValue(row, "ふりがな", `${data.lastNameKana} ${data.firstNameKana}`, `A${row}:A${row}`, `B${row}:C${row}`);
  row++;

  // 氏名
  addLabelValue(row, "氏　名", `${data.lastName} ${data.firstName}`, `A${row}:A${row}`, `B${row}:C${row}`, 14, true, 24);
  row++;

  // 生年月日・性別
  const bd = data.birthDate ? new Date(data.birthDate) : null;
  const bdStr = bd ? `${bd.getFullYear()}年${bd.getMonth() + 1}月${bd.getDate()}日（満${calcAge(data.birthDate)}歳）` : "";
  addLabelValue(row, "生年月日", bdStr, `A${row}:A${row}`, `B${row}:B${row}`);

  ws.mergeCells(`C${row}:C${row}`);
  const gLabelCell = ws.getCell(`C${row}`);
  gLabelCell.value = "性別";
  gLabelCell.font = { name: "游明朝", size: 8 };
  gLabelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  gLabelCell.alignment = { horizontal: "center", vertical: "middle" };
  gLabelCell.border = border();
  row++;

  // 住所
  const address = [data.postalCode ? `〒${data.postalCode}` : "", data.prefecture, data.cityTown, data.addressLine].filter(Boolean).join(" ");
  addLabelValue(row, "電話", data.phone, `A${row}:A${row}`, `B${row}:B${row}`);
  row++;
  addLabelValue(row, "現住所", address, `A${row}:A${row}`, `B${row}:C${row}`);
  row++;
  addLabelValue(row, "E-mail", data.email, `A${row}:A${row}`, `B${row}:C${row}`);
  row++;

  // 空白行
  row++;

  // 自己PR
  ws.mergeCells(`A${row}:C${row}`);
  const prLabel = ws.getCell(`A${row}`);
  prLabel.value = "志望の動機、特技、好きな学科、アピールポイントなど";
  prLabel.font = { name: "游明朝", size: 8 };
  prLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  prLabel.alignment = { vertical: "middle" };
  prLabel.border = border();
  row++;

  ws.mergeCells(`A${row}:C${row + 4}`);
  const prCell = ws.getCell(`A${row}`);
  prCell.value = data.prText;
  prCell.font = { name: "游明朝", size: 9 };
  prCell.alignment = { vertical: "top", wrapText: true };
  prCell.border = border();
  row += 5;

  // 本人希望欄
  ws.mergeCells(`A${row}:C${row}`);
  const prefLabel = ws.getCell(`A${row}`);
  prefLabel.value = "本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）";
  prefLabel.font = { name: "游明朝", size: 7 };
  prefLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  prefLabel.alignment = { vertical: "middle" };
  prefLabel.border = border();
  row++;

  ws.mergeCells(`A${row}:C${row + 2}`);
  const prefCell = ws.getCell(`A${row}`);
  prefCell.value = data.jobPreference;
  prefCell.font = { name: "游明朝", size: 9 };
  prefCell.alignment = { vertical: "top", wrapText: true };
  prefCell.border = border();
  row += 3;

  // --- 右列: 学歴・職歴テーブル ---
  // 右列はD〜F列（row 2から）
  let rr = 2;

  // ヘッダー
  ws.mergeCells(`D${rr}:D${rr}`);
  const h1 = ws.getCell(`D${rr}`);
  h1.value = "年"; h1.font = { name: "游明朝", size: 8, bold: true };
  h1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  h1.alignment = { horizontal: "center", vertical: "middle" }; h1.border = border();

  ws.mergeCells(`E${rr}:E${rr}`);
  const h2 = ws.getCell(`E${rr}`);
  h2.value = "月"; h2.font = { name: "游明朝", size: 8, bold: true };
  h2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  h2.alignment = { horizontal: "center", vertical: "middle" }; h2.border = border();

  ws.mergeCells(`F${rr}:F${rr}`);
  const h3 = ws.getCell(`F${rr}`);
  h3.value = "学　歴・職　歴（各別にまとめて書く）";
  h3.font = { name: "游明朝", size: 8, bold: true };
  h3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  h3.alignment = { horizontal: "center", vertical: "middle" }; h3.border = border();
  rr++;

  const addHistoryRow = (year: number | null, month: number | null, content: string, isHeader = false) => {
    const yc = ws.getCell(`D${rr}`);
    yc.value = year ?? "";
    yc.font = { name: "游明朝", size: 8 };
    yc.alignment = { horizontal: "center", vertical: "middle" };
    yc.border = border();

    const mc = ws.getCell(`E${rr}`);
    mc.value = month ?? "";
    mc.font = { name: "游明朝", size: 8 };
    mc.alignment = { horizontal: "center", vertical: "middle" };
    mc.border = border();

    ws.mergeCells(`F${rr}:F${rr}`);
    const cc = ws.getCell(`F${rr}`);
    cc.value = content;
    cc.font = { name: "游明朝", size: isHeader ? 8 : 9, bold: isHeader };
    if (isHeader) cc.alignment = { horizontal: "center", vertical: "middle" };
    else cc.alignment = { vertical: "middle" };
    cc.border = border();
    ws.getRow(rr).height = 16;
    rr++;
  };

  // 学歴
  addHistoryRow(null, null, "学　　歴", true);
  for (const e of data.educations) {
    const text = `${e.schoolName}${e.faculty ? ` ${e.faculty}` : ""}　${e.status}`;
    addHistoryRow(e.year, e.month, text);
  }

  // 職歴
  addHistoryRow(null, null, "職　　歴", true);
  for (const w of data.workExperiences) {
    addHistoryRow(w.startYear, w.startMonth, `${w.companyName}${w.department ? ` ${w.department}` : ""}　入社`);
    if (!w.isCurrent && w.endYear && w.endMonth) {
      addHistoryRow(w.endYear, w.endMonth, `${w.companyName}　退社`);
    }
  }
  addHistoryRow(null, null, "以　上");

  // 空行補完
  while (rr < row - 4) addHistoryRow(null, null, "");

  // 資格・免許ヘッダー
  ws.getCell(`D${rr}`).value = "年";
  ws.getCell(`D${rr}`).font = { name: "游明朝", size: 8, bold: true };
  ws.getCell(`D${rr}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  ws.getCell(`D${rr}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`D${rr}`).border = border();
  ws.getCell(`E${rr}`).value = "月";
  ws.getCell(`E${rr}`).font = { name: "游明朝", size: 8, bold: true };
  ws.getCell(`E${rr}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  ws.getCell(`E${rr}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`E${rr}`).border = border();
  ws.mergeCells(`F${rr}:F${rr}`);
  ws.getCell(`F${rr}`).value = "資　格・免　許";
  ws.getCell(`F${rr}`).font = { name: "游明朝", size: 8, bold: true };
  ws.getCell(`F${rr}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  ws.getCell(`F${rr}`).alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell(`F${rr}`).border = border();
  rr++;

  for (const c of data.certifications) {
    addHistoryRow(c.year, c.month, `${c.name}　取得`);
  }
  // 資格欄も最低6行
  while (data.certifications.length + rr < rr + 6) addHistoryRow(null, null, "");

  return Buffer.from(await wb.xlsx.writeBuffer());
}
