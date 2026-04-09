export type AdminPermissions = {
  dashboard: boolean;
  companies: boolean;
  jobseekers: boolean;
  jobs: boolean;
  columns: boolean;
  billing: boolean;
  invoices: boolean;
  invalidRequests: boolean;
  inquiries: boolean;
  analytics: boolean;
};

export const ALL_PERMISSIONS: AdminPermissions = {
  dashboard: true,
  companies: true,
  jobseekers: true,
  jobs: true,
  columns: true,
  billing: true,
  invoices: true,
  invalidRequests: true,
  inquiries: true,
  analytics: true,
};

export const EMPTY_PERMISSIONS: AdminPermissions = {
  dashboard: false,
  companies: false,
  jobseekers: false,
  jobs: false,
  columns: false,
  billing: false,
  invoices: false,
  invalidRequests: false,
  inquiries: false,
  analytics: false,
};

export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  dashboard: "ダッシュボード",
  companies: "企業一覧",
  jobseekers: "求職者一覧",
  jobs: "求人一覧",
  columns: "コラム管理",
  billing: "請求単価管理",
  invoices: "請求一覧",
  invalidRequests: "無効申請",
  inquiries: "問い合わせ",
  analytics: "分析",
};

export function parsePermissions(raw: unknown): AdminPermissions {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PERMISSIONS };
  const obj = raw as Record<string, unknown>;
  return {
    dashboard: obj.dashboard === true,
    companies: obj.companies === true,
    jobseekers: obj.jobseekers === true,
    jobs: obj.jobs === true,
    columns: obj.columns === true,
    billing: obj.billing === true,
    invoices: obj.invoices === true,
    invalidRequests: obj.invalidRequests === true,
    inquiries: obj.inquiries === true,
    analytics: obj.analytics === true,
  };
}
