/**
 * 現在の日付から、表示対象の卒業年度を算出する。
 * - 1月に切り替え（就活市場のサイクルに合わせる）
 * - 例: 2026年1月〜12月 → 27卒・28卒が対象
 *   (27卒 = 直近卒, 28卒 = 次年度卒)
 * - 2027年1月になったら → 28卒・29卒に切り替わる
 */
export function getActiveGraduationYears(): number[] {
  const now = new Date();
  const year = now.getFullYear();

  // その年の1月〜12月で year+1卒 と year+2卒 が対象
  // 例: 2026年 → 27卒・28卒, 2027年 → 28卒・29卒
  return [year + 1, year + 2];
}

/** 卒業年度をラベルに変換 (例: 2027 → "27卒") */
export function graduationYearLabel(year: number): string {
  return `${String(year).slice(-2)}卒`;
}
