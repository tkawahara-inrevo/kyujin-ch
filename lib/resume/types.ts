export type EducationEntry = {
  id?: string;
  schoolType: string;
  schoolName: string;
  faculty: string;
  status: string;
  year: number;
  month: number;
  sortOrder: number;
};

export type WorkExperienceEntry = {
  id?: string;
  companyName: string;
  department: string;
  jobType: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  description: string;
  sortOrder: number;
};

export type CertificationEntry = {
  id?: string;
  name: string;
  year: number;
  month: number;
  sortOrder: number;
};

export type ResumeData = {
  // 基本情報
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string; // YYYY-MM-DD
  gender: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  cityTown: string;
  addressLine: string;
  // 書類データ
  educations: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  certifications: CertificationEntry[];
  prText: string;
  jobPreference: string;
  // 生成設定
  docType: "resume" | "career" | "both";
  outputFormat: ("pdf" | "xlsx")[];
  careerJobType: string; // 職務経歴書の職種カテゴリ
};

export const CAREER_JOB_TYPES = [
  { value: "general", label: "一般職（汎用）" },
  { value: "sales", label: "営業職" },
  { value: "it_engineer", label: "ITエンジニア" },
  { value: "office", label: "事務・経理・総務" },
  { value: "creative", label: "クリエイティブ・デザイン" },
  { value: "medical", label: "医療・介護・福祉" },
  { value: "manufacturing", label: "製造・物流・軽作業" },
  { value: "management", label: "管理職・経営" },
  { value: "education", label: "教育・保育" },
  { value: "service", label: "接客・サービス" },
] as const;

export const SCHOOL_TYPES = [
  "中学校",
  "高等学校",
  "大学",
  "短期大学",
  "専門学校",
  "大学院",
  "その他",
];

export const EDUCATION_STATUSES = ["入学", "卒業", "中退", "在学中"];

export const PRESET_CERTIFICATIONS = [
  "普通自動車第一種運転免許",
  "普通自動二輪車免許",
  "英語検定（英検）2級",
  "英語検定（英検）準1級",
  "英語検定（英検）1級",
  "TOEIC 600点以上",
  "TOEIC 700点以上",
  "TOEIC 800点以上",
  "日本語能力試験（JLPT）N2",
  "日本語能力試験（JLPT）N1",
  "簿記3級（日商）",
  "簿記2級（日商）",
  "簿記1級（日商）",
  "ITパスポート",
  "基本情報技術者",
  "応用情報技術者",
  "宅地建物取引士",
  "社会保険労務士",
  "ファイナンシャルプランナー2級",
  "ファイナンシャルプランナー1級",
  "介護福祉士",
  "ケアマネージャー",
  "看護師",
  "保育士",
];
