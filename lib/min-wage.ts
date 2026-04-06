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
const MONTHLY_HOURS = 173;

export type MinWageCheckResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * 入力された給与が最低賃金を下回っていないか検証する
 * @param salaryType 給与種別
 * @param salaryMin 給与下限（円）
 * @param prefecture 都道府県名（例: "東京都"）
 */
export function checkMinWage(
  salaryType: string,
  salaryMin: number,
  prefecture: string,
): MinWageCheckResult {
  const minWage = MIN_WAGE_BY_PREFECTURE[prefecture];
  if (!minWage) return { ok: true }; // 都道府県不明の場合はスキップ

  let hourlyEquiv: number;
  let calcNote: string;

  switch (salaryType) {
    case "hourly":
      hourlyEquiv = salaryMin;
      calcNote = `時給 ${salaryMin.toLocaleString()}円`;
      break;
    case "daily":
      hourlyEquiv = salaryMin / 8;
      calcNote = `日給 ${salaryMin.toLocaleString()}円 ÷ 8時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
      break;
    case "monthly":
      hourlyEquiv = salaryMin / MONTHLY_HOURS;
      calcNote = `月給 ${salaryMin.toLocaleString()}円 ÷ ${MONTHLY_HOURS}時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
      break;
    case "annual":
      hourlyEquiv = salaryMin / 12 / MONTHLY_HOURS;
      calcNote = `年俸 ${salaryMin.toLocaleString()}円 ÷ 12ヶ月 ÷ ${MONTHLY_HOURS}時間 = ${Math.floor(hourlyEquiv).toLocaleString()}円/時`;
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
