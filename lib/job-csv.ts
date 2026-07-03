import { EMPLOYMENT_OPTIONS } from "@/lib/job-options";

/** CSV テンプレートに含まれるカラム定義 (順序が重要) */
export const JOB_CSV_COLUMNS = [
  { key: "title", label: "求人タイトル", required: true, hint: "必須。例: 営業スタッフ募集" },
  { key: "targetType", label: "対象", required: true, hint: "必須。中途 / 新卒 / アルバイト・インターン / 派遣" },
  { key: "categoryTag", label: "求人カテゴリ", required: true, hint: "必須。例: 営業 / IT / 販売/サービス" },
  { key: "jobSubcategory", label: "職種", required: false, hint: "任意。カテゴリ配下の職種名 (例: 法人営業)" },
  { key: "employmentType", label: "雇用形態", required: true, hint: "必須。正社員 / 契約社員 / 派遣社員 / アルバイト / 業務委託" },
  { key: "region", label: "勤務地エリア", required: false, hint: "任意。例: 東京都 / 大阪府" },
  { key: "location", label: "勤務地(都道府県)", required: true, hint: "必須。例: 東京都" },
  { key: "salaryType", label: "給与種別", required: true, hint: "必須。年俸 / 月給 / 日給 / 時給" },
  { key: "salaryMin", label: "給与下限", required: true, hint: "必須。金額 (円)。時給1500なら 1500" },
  { key: "salaryMax", label: "給与上限", required: false, hint: "任意。金額 (円)。空欄可" },
  { key: "description", label: "求人内容", required: true, hint: "必須。仕事内容の詳細" },
  { key: "requirements", label: "応募資格", required: false, hint: "任意" },
  { key: "workingHours", label: "勤務時間", required: false, hint: "任意。例: 9:00〜18:00" },
  { key: "tags", label: "タグ (カンマ区切り)", required: false, hint: "任意。例: 未経験歓迎,週休二日,リモート可" },
] as const;

export type JobCsvColumn = (typeof JOB_CSV_COLUMNS)[number]["key"];

const TARGET_MAP: Record<string, string> = {
  "中途": "MID_CAREER",
  "新卒": "NEW_GRAD",
  "アルバイト・インターン": "PART_TIME_INTERN",
  "アルバイト": "PART_TIME_INTERN",
  "インターン": "PART_TIME_INTERN",
  "派遣": "TEMPORARY",
};

const EMPLOYMENT_MAP: Record<string, string> = Object.fromEntries(
  EMPLOYMENT_OPTIONS.map((o) => [o.label, o.value]),
);

const SALARY_TYPE_MAP: Record<string, string> = {
  "年俸": "annual",
  "月給": "monthly",
  "日給": "daily",
  "時給": "hourly",
};

export type ParsedJobRow = {
  title: string;
  targetType: string;
  categoryTag: string;
  jobSubcategory: string | null;
  employmentType: string;
  region: string | null;
  location: string;
  salaryType: string;
  salaryMin: number;
  salaryMax: number | null;
  description: string;
  requirements: string | null;
  workingHours: string | null;
  tags: string[];
};

/** 1行分の CSV データ (map) をパースして求人データにする。エラーがあれば集めて返す */
export function parseJobCsvRow(record: Record<string, string>): {
  ok: boolean;
  data?: ParsedJobRow;
  errors: string[];
} {
  const errors: string[] = [];
  const get = (key: JobCsvColumn) => (record[key] ?? "").trim();

  const title = get("title");
  if (!title) errors.push("求人タイトルは必須です");

  const targetLabel = get("targetType");
  const targetType = TARGET_MAP[targetLabel];
  if (!targetLabel) errors.push("対象は必須です");
  else if (!targetType) errors.push(`対象「${targetLabel}」は不正です (中途 / 新卒 / アルバイト・インターン / 派遣)`);

  const categoryTag = get("categoryTag");
  if (!categoryTag) errors.push("求人カテゴリは必須です");
  const jobSubcategory = get("jobSubcategory") || null;

  const employmentLabel = get("employmentType");
  const employmentType = EMPLOYMENT_MAP[employmentLabel];
  if (!employmentLabel) errors.push("雇用形態は必須です");
  else if (!employmentType) errors.push(`雇用形態「${employmentLabel}」は不正です (正社員 / 契約社員 / 派遣社員 / アルバイト / 業務委託)`);

  const region = get("region") || null;
  const location = get("location");
  if (!location) errors.push("勤務地(都道府県)は必須です");

  const salaryTypeLabel = get("salaryType");
  const salaryType = SALARY_TYPE_MAP[salaryTypeLabel];
  if (!salaryTypeLabel) errors.push("給与種別は必須です");
  else if (!salaryType) errors.push(`給与種別「${salaryTypeLabel}」は不正です (年俸 / 月給 / 日給 / 時給)`);

  const salaryMinRaw = get("salaryMin");
  const salaryMin = Number(salaryMinRaw.replace(/[,円\s]/g, ""));
  if (!salaryMinRaw) errors.push("給与下限は必須です");
  else if (!Number.isFinite(salaryMin) || salaryMin < 0) errors.push(`給与下限「${salaryMinRaw}」は数値ではありません`);

  const salaryMaxRaw = get("salaryMax");
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw.replace(/[,円\s]/g, "")) : null;
  if (salaryMaxRaw && (!Number.isFinite(salaryMax) || (salaryMax ?? 0) < 0)) {
    errors.push(`給与上限「${salaryMaxRaw}」は数値ではありません`);
  }

  const description = get("description");
  if (!description) errors.push("求人内容は必須です");

  const requirements = get("requirements") || null;
  const workingHours = get("workingHours") || null;
  const tagsRaw = get("tags");
  const tags = tagsRaw
    ? tagsRaw.split(/[,、]/).map((t) => t.trim()).filter(Boolean)
    : [];

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    data: {
      title,
      targetType: targetType!,
      categoryTag,
      jobSubcategory,
      employmentType: employmentType!,
      region,
      location,
      salaryType: salaryType!,
      salaryMin,
      salaryMax,
      description,
      requirements,
      workingHours,
      tags,
    },
  };
}

/** テンプレート CSV 文字列を生成 */
export function buildTemplateCsv(): string {
  const header = JOB_CSV_COLUMNS.map((c) => c.label);
  const sample: string[] = [
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
  ];
  const commentRow = JOB_CSV_COLUMNS.map((c) => c.hint);
  const rows = [header, commentRow, sample];
  return rows.map((row) => row.map((v) => `"${(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
}
