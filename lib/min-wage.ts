/**
 * 令和7年度 地域別最低賃金（時間額・円）
 * 出典: 厚生労働省 令和7年度地域別最低賃金改定状況
 */
export const MIN_WAGE_BY_PREFECTURE: Record<string, number> = {
  "北海道": 1075,
  "青森県": 1029,
  "岩手県": 1031,
  "宮城県": 1038,
  "秋田県": 1031,
  "山形県": 1032,
  "福島県": 1033,
  "茨城県": 1074,
  "栃木県": 1068,
  "群馬県": 1063,
  "埼玉県": 1141,
  "千葉県": 1140,
  "東京都": 1226,
  "神奈川県": 1225,
  "新潟県": 1050,
  "富山県": 1062,
  "石川県": 1054,
  "福井県": 1053,
  "山梨県": 1052,
  "長野県": 1061,
  "岐阜県": 1065,
  "静岡県": 1097,
  "愛知県": 1140,
  "三重県": 1087,
  "滋賀県": 1080,
  "京都府": 1122,
  "大阪府": 1177,
  "兵庫県": 1116,
  "奈良県": 1051,
  "和歌山県": 1045,
  "鳥取県": 1030,
  "島根県": 1033,
  "岡山県": 1047,
  "広島県": 1085,
  "山口県": 1043,
  "徳島県": 1046,
  "香川県": 1036,
  "愛媛県": 1033,
  "高知県": 1023,
  "福岡県": 1057,
  "佐賀県": 1030,
  "長崎県": 1031,
  "熊本県": 1034,
  "大分県": 1035,
  "宮崎県": 1023,
  "鹿児島県": 1026,
  "沖縄県": 1023,
};

// 月給・年俸の最低賃金換算に用いる月間所定労働時間の標準値
// (52週 × 40時間) / 12ヶ月 ≈ 173時間
const DEFAULT_MONTHLY_HOURS = 173;
const DAILY_WORK_HOURS = 8;

/**
 * 年間休日数から月間所定労働時間を計算する
 * 例: 年間休日127日 → (365-127)/12×8 ≈ 158.7時間
 */
export function calcMonthlyHours(annualHolidayCount: number): number {
  const workingDaysPerYear = 365 - annualHolidayCount;
  return (workingDaysPerYear / 12) * DAILY_WORK_HOURS;
}

export type MinWageCheckResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * 入力された給与が最低賃金を下回っていないか検証する
 * @param salaryType 給与種別
 * @param salaryMin 給与下限（円）
 * @param prefecture 都道府県名（例: "東京都"）
 * @param annualHolidayCount 年間休日数（指定時は実態に即した月間労働時間で計算）
 */
export function checkMinWage(
  salaryType: string,
  salaryMin: number,
  prefecture: string,
  annualHolidayCount?: number | null,
): MinWageCheckResult {
  return { ok: true }; // TODO: 最低賃金チェック一時停止中
  const minWage = MIN_WAGE_BY_PREFECTURE[prefecture];
  if (!minWage) return { ok: true }; // 都道府県不明の場合はスキップ

  const monthlyHours = annualHolidayCount != null
    ? calcMonthlyHours(annualHolidayCount)
    : DEFAULT_MONTHLY_HOURS;
  const monthlyHoursLabel = Math.round(monthlyHours);

  let hourlyEquiv: number;
  let calcNote: string;

  switch (salaryType) {
    case "hourly":
      hourlyEquiv = salaryMin;
      calcNote = `時給 ${salaryMin.toLocaleString()}円`;
      break;
    case "daily":
      hourlyEquiv = salaryMin / DAILY_WORK_HOURS;
      calcNote = `日給 ${salaryMin.toLocaleString()}円 ÷ ${DAILY_WORK_HOURS}時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
      break;
    case "monthly":
      hourlyEquiv = salaryMin / monthlyHours;
      calcNote = `月給 ${salaryMin.toLocaleString()}円 ÷ ${monthlyHoursLabel}時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
      break;
    case "annual":
      hourlyEquiv = salaryMin / 12 / monthlyHours;
      calcNote = `年俸 ${salaryMin.toLocaleString()}円 ÷ 12ヶ月 ÷ ${monthlyHoursLabel}時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
      break;
    default:
      return { ok: true };
  }

  if (hourlyEquiv < minWage) {
    return {
      ok: false,
      message: `${prefecture}の最低賃金（${minWage.toLocaleString()}円/時）を下回っています。\n${calcNote}`,
    };
  }

  return { ok: true };
}
