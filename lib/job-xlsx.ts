import ExcelJS from "exceljs";
import { JOB_CSV_COLUMNS } from "@/lib/job-csv";
import { CATEGORY_OPTIONS, EMPLOYMENT_OPTIONS } from "@/lib/job-options";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const REGIONS = [
  "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州・沖縄",
];

const TARGETS = ["中途", "新卒", "アルバイト・インターン", "派遣"];
const EMPLOYMENTS = EMPLOYMENT_OPTIONS.map((o) => o.label);
const SALARY_TYPES = ["年俸", "月給", "日給", "時給"];
const CATEGORIES = [...CATEGORY_OPTIONS];

/** テンプレート XLSX を生成 (Data Validation でドロップダウン付き) */
export async function buildTemplateXlsx(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("求人一括登録");
  const refWs = wb.addWorksheet("選択肢一覧");
  refWs.state = "visible"; // 参照用シート、ユーザーが選択肢を確認できる

  // 1行目: カラム名 (太字ヘッダー)
  const headerRow = ws.addRow(JOB_CSV_COLUMNS.map((c) => c.label));
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F6CFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 30;

  // 2行目: 説明・ヒント
  const hintRow = ws.addRow(JOB_CSV_COLUMNS.map((c) => c.hint));
  hintRow.font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
  hintRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  hintRow.alignment = { vertical: "middle", wrapText: true };
  hintRow.height = 40;

  // 3行目: サンプルデータ
  ws.addRow([
    "営業スタッフ募集",
    "中途",
    "営業",
    "法人営業",
    "正社員",
    "関東",
    "東京都",
    "月給",
    "250000",
    "400000",
    "既存顧客への提案営業から新規開拓まで幅広く対応いただきます。",
    "大卒以上、営業経験1年以上",
    "9:00〜18:00 (休憩1時間)",
    "未経験歓迎,週休二日",
  ]);

  // カラム幅設定
  const widths = [30, 14, 20, 20, 14, 14, 14, 12, 12, 12, 40, 30, 20, 30];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // 参照シートに選択肢を書き込む
  refWs.columns = [
    { header: "対象", width: 20 },
    { header: "雇用形態", width: 16 },
    { header: "給与種別", width: 12 },
    { header: "求人カテゴリ", width: 24 },
    { header: "勤務地エリア", width: 16 },
    { header: "都道府県", width: 14 },
  ];
  refWs.getRow(1).font = { bold: true };
  const maxLen = Math.max(TARGETS.length, EMPLOYMENTS.length, SALARY_TYPES.length, CATEGORIES.length, REGIONS.length, PREFECTURES.length);
  for (let i = 0; i < maxLen; i++) {
    refWs.addRow([
      TARGETS[i] ?? "",
      EMPLOYMENTS[i] ?? "",
      SALARY_TYPES[i] ?? "",
      CATEGORIES[i] ?? "",
      REGIONS[i] ?? "",
      PREFECTURES[i] ?? "",
    ]);
  }

  // Data Validation を設定 (3〜1000 行目まで)
  const validationStartRow = 3;
  const validationEndRow = 1000;

  // カラム列 (1-indexed)
  const columnLetters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];

  const addListValidation = (colIdx: number, values: string[]) => {
    const letter = columnLetters[colIdx];
    const range = `${letter}${validationStartRow}:${letter}${validationEndRow}`;
    // 値をカンマ区切り (Excel の仕様: "" で囲まない、直接値のカンマリスト)
    const formulae = [`"${values.join(",")}"`];
    for (let r = validationStartRow; r <= validationEndRow; r++) {
      ws.getCell(`${letter}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae,
        showErrorMessage: true,
        errorStyle: "warning",
        errorTitle: "選択肢外の値",
        error: `選択肢一覧シートを参照して選んでください`,
      } as ExcelJS.DataValidation;
      void range;
    }
  };

  // targetType = 対象 (B列 / idx 1)
  addListValidation(1, TARGETS);
  // categoryTag = 求人カテゴリ (C列 / idx 2)
  addListValidation(2, CATEGORIES);
  // employmentType = 雇用形態 (E列 / idx 4)
  addListValidation(4, EMPLOYMENTS);
  // region = 勤務地エリア (F列 / idx 5)
  addListValidation(5, REGIONS);
  // location = 都道府県 (G列 / idx 6)
  addListValidation(6, PREFECTURES);
  // salaryType = 給与種別 (H列 / idx 7)
  addListValidation(7, SALARY_TYPES);

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

/** アップロードされた XLSX をパース → 行配列に変換 (CSV パーサ形式と互換) */
export async function parseXlsxToRows(buffer: Buffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  const rows: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value;
      if (v == null) values.push("");
      else if (typeof v === "object" && "richText" in v && Array.isArray((v as { richText: { text: string }[] }).richText))
        values.push((v as { richText: { text: string }[] }).richText.map((r) => r.text).join(""));
      else if (typeof v === "object" && "result" in v) values.push(String((v as { result: unknown }).result ?? ""));
      else if (typeof v === "object" && "text" in v) values.push(String((v as { text: unknown }).text));
      else values.push(String(v));
    });
    rows.push(values);
  });
  return rows;
}
