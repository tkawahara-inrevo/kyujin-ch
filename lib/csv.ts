/**
 * 簡易 CSV パーサ (RFC 4180 準拠、Excel の日本語 CSV も想定)
 *
 * サポート:
 * - ダブルクォート囲みフィールド ("Hello, World")
 * - エスケープ ("She said ""Hi""" → She said "Hi")
 * - CR / LF / CRLF 改行
 * - 先頭 BOM 除去
 *
 * 未サポート: セル内改行を含む複雑な形式は非対応 (行はレコード単位を仮定)
 */
export function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (inQuotes) {
      if (ch === '"') {
        if (normalized[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (ch === "\r" || ch === "\n") {
        currentRow.push(currentField);
        currentField = "";
        if (currentRow.length > 1 || currentRow[0] !== "") {
          rows.push(currentRow);
        }
        currentRow = [];
        if (ch === "\r" && normalized[i + 1] === "\n") i++;
      } else {
        currentField += ch;
      }
    }
  }
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || currentRow[0] !== "") {
      rows.push(currentRow);
    }
  }
  return rows;
}

/**
 * CSV セルの安全なエスケープ (二重引用符と改行/カンマを含む場合はクォート)
 */
export function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * 行の配列を CSV 文字列にする
 */
export function stringifyCsv(rows: (string | null | undefined)[][]): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
}
