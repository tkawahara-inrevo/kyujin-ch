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

// フォームで上部に常時表示する主要福利厚生
export const PRIMARY_BENEFIT_OPTIONS = [
  "雇用保険",
  "労災保険",
  "厚生年金",
  "健康保険",
  "住宅手当・家賃補助",
  "食事補助",
  "定期健康診断",
  "フレックスタイム制度",
  "リモートワーク制度",
] as const;

export const BENEFIT_OPTIONS = [
  // 主要（PRIMARY_BENEFIT_OPTIONSと同一順で先頭に置く）
  "雇用保険",
  "労災保険",
  "厚生年金",
  "健康保険",
  "住宅手当・家賃補助",
  "食事補助",
  "定期健康診断",
  "フレックスタイム制度",
  "リモートワーク制度",
  // その他
  "交通費支給",
  "社会保険完備",
  "資格取得支援",
  "住宅手当",
  "家族手当",
  "役職手当",
  "慶弔見舞金",
  "時差出勤制度",
  "在宅勤務制度",
  "フレックス制度",
  "副業OK",
  "制服貸与",
  "昼食補助",
  "社員食堂",
  "社割制度",
  "商品割引制度",
  "社用車貸与",
  "社宅制度",
  "育児支援制度",
  "シフト手当",
  "深夜手当",
  "研究手当",
  "医療費補助",
  "持株会制度",
  "退職金制度",
  "企業型確定拠出年金",
  "技術書購入補助",
  "書籍購入補助",
  "セミナー参加補助",
  "表彰制度",
  "高性能PC貸与",
  "PC貸与",
  "PC周辺機器補助",
  "制作環境補助",
  "デザインツール補助",
  "商談ツール支給",
  "営業交通費全額支給",
  "インセンティブ制度",
  "反響インセンティブ",
  "カウンセリング研修",
  "資格手当",
  "現場手当",
] as const;
