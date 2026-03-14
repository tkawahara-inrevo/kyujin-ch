export const OTHER_CATEGORY_VALUE = "その他";

export const CATEGORY_OPTIONS = [
  "営業",
  "企画/マーケティング",
  "コーポレートスタッフ",
  "IT",
  "建築/土木",
  "不動産",
  "機械/電気",
  "化学",
  "医薬品",
  "交通/運輸",
  "人材サービス",
  "コンサルタント",
  "金融",
  "経理",
  "クリエイティブ",
  "販売/サービス",
  "デザイナー",
  "食品",
  OTHER_CATEGORY_VALUE,
] as const;

export const EMPLOYMENT_OPTIONS = [
  { value: "FULL_TIME", label: "正社員" },
  { value: "PART_TIME", label: "パート" },
  { value: "CONTRACT", label: "契約社員" },
  { value: "TEMPORARY", label: "派遣" },
  { value: "INTERN", label: "インターン" },
  { value: "OTHER", label: "その他" },
] as const;

export const EMPLOYMENT_FILTER_OPTIONS = [
  { value: "", label: "すべて" },
  ...EMPLOYMENT_OPTIONS,
] as const;

export const EMPLOYMENT_LABELS = Object.fromEntries(
  EMPLOYMENT_OPTIONS.map((option) => [
    option.value,
    option.label,
  ]),
) as Record<string, string>;
