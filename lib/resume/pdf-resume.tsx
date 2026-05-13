import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ResumeData } from "./types";

Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75vY0rw-oME.woff2",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJEm75vY0rw-oME.woff2",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    fontSize: 8,
  },
  // テーブルスタイル
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#333",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  lastRow: {
    flexDirection: "row",
  },
  labelCell: {
    backgroundColor: "#f5f5f5",
    borderRightWidth: 0.5,
    borderRightColor: "#333",
    padding: 3,
    justifyContent: "center",
    fontSize: 7,
  },
  valueCell: {
    padding: 3,
    justifyContent: "center",
    fontSize: 8,
  },
  sectionHeader: {
    backgroundColor: "#e8e8e8",
    padding: 3,
    fontSize: 8,
    fontWeight: "bold",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  historyRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: "#999",
    minHeight: 16,
  },
  yearCell: {
    width: 30,
    borderRightWidth: 0.3,
    borderRightColor: "#999",
    padding: 2,
    fontSize: 7,
    textAlign: "center",
    justifyContent: "center",
  },
  monthCell: {
    width: 20,
    borderRightWidth: 0.3,
    borderRightColor: "#999",
    padding: 2,
    fontSize: 7,
    textAlign: "center",
    justifyContent: "center",
  },
  historyContent: {
    flex: 1,
    padding: 2,
    fontSize: 8,
  },
  smallText: {
    fontSize: 6,
    color: "#666",
  },
  twoCol: {
    flexDirection: "row",
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  noteBox: {
    borderWidth: 0.5,
    borderColor: "#333",
    minHeight: 60,
    padding: 4,
    fontSize: 8,
  },
  labelSmall: {
    fontSize: 7,
    color: "#555",
    marginBottom: 2,
  },
});

function calcAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function padMonth(m: number): string {
  return String(m).padStart(2, "0");
}

const EMPTY_ROWS = 2;

export function ResumePDF({ data }: { data: ResumeData }) {
  const today = new Date();
  const address = [data.postalCode ? `〒${data.postalCode}` : "", data.prefecture, data.cityTown, data.addressLine]
    .filter(Boolean)
    .join(" ");

  // 学歴・職歴をマージして時系列でソート
  type HistoryRow = { year: number; month: number; text: string; type: "edu" | "work" | "blank" };
  const rows: HistoryRow[] = [];

  // 学歴
  if (data.educations.length > 0) {
    rows.push({ year: 0, month: 0, text: "学　　歴", type: "blank" });
    for (const e of data.educations) {
      rows.push({
        year: e.year,
        month: e.month,
        text: `${e.schoolName}${e.faculty ? ` ${e.faculty}` : ""}　${e.status}`,
        type: "edu",
      });
    }
  }

  // 職歴
  if (data.workExperiences.length > 0) {
    rows.push({ year: 0, month: 0, text: "職　　歴", type: "blank" });
    for (const w of data.workExperiences) {
      rows.push({
        year: w.startYear,
        month: w.startMonth,
        text: `${w.companyName}${w.department ? ` ${w.department}` : ""}　入社`,
        type: "work",
      });
      if (!w.isCurrent && w.endYear && w.endMonth) {
        rows.push({
          year: w.endYear,
          month: w.endMonth,
          text: `${w.companyName}　退社`,
          type: "work",
        });
      }
    }
    rows.push({ year: 0, month: 0, text: "以上", type: "blank" });
  }

  // 空行を補完して最低行数確保
  const minRows = 16;
  while (rows.length < minRows) {
    rows.push({ year: 0, month: 0, text: "", type: "blank" });
  }

  // 資格欄
  const certRows = [...data.certifications];
  while (certRows.length < 6) {
    certRows.push({ name: "", year: 0, month: 0, sortOrder: 0 });
  }

  return (
    <Document>
      {/* ページ1: 基本情報 + 学歴職歴（左半分） */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.twoCol}>
          {/* 左列: 基本情報 */}
          <View style={[styles.halfWidth, { marginRight: 8 }]}>
            <Text style={styles.title}>履　歴　書</Text>
            <View style={styles.dateRow}>
              <Text>{today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日現在</Text>
            </View>

            {/* 氏名・ふりがな */}
            <View style={styles.table}>
              <View style={styles.row}>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>ふりがな</Text>
                </View>
                <View style={[styles.valueCell, { flex: 1 }]}>
                  <Text>{data.lastNameKana} {data.firstNameKana}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>氏　名</Text>
                </View>
                <View style={[styles.valueCell, { flex: 1 }]}>
                  <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                    {data.lastName} {data.firstName}
                  </Text>
                </View>
              </View>
              {/* 生年月日・性別 */}
              <View style={styles.row}>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>生年月日</Text>
                </View>
                <View style={[styles.valueCell, { flex: 1 }]}>
                  <Text>
                    {formatBirthDate(data.birthDate)}
                    {"　"}（満{calcAge(data.birthDate)}歳）
                  </Text>
                </View>
                <View style={[styles.labelCell, { width: 30 }]}>
                  <Text>性別</Text>
                </View>
                <View style={[styles.valueCell, { width: 40 }]}>
                  <Text>{data.gender}</Text>
                </View>
              </View>
              {/* 住所 */}
              <View style={styles.row}>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>ふりがな</Text>
                </View>
                <View style={[styles.valueCell, { flex: 1 }]}>
                  <Text> </Text>
                </View>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>電話</Text>
                </View>
                <View style={[styles.valueCell, { width: 80 }]}>
                  <Text>{data.phone}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>現住所 〒</Text>
                </View>
                <View style={[styles.valueCell, { flex: 1 }]}>
                  <Text>{address}</Text>
                </View>
                <View style={[styles.labelCell, { width: 50 }]}>
                  <Text>E-mail</Text>
                </View>
                <View style={[styles.valueCell, { width: 80 }]}>
                  <Text style={{ fontSize: 7 }}>{data.email}</Text>
                </View>
              </View>
            </View>

            {/* 自己PR */}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.labelSmall}>
                志望の動機、特技、好きな学科、アピールポイントなど
              </Text>
              <View style={styles.noteBox}>
                <Text>{data.prText}</Text>
              </View>
            </View>

            {/* 本人希望欄 */}
            <View style={{ marginTop: 6 }}>
              <Text style={styles.labelSmall}>
                本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）
              </Text>
              <View style={[styles.noteBox, { minHeight: 40 }]}>
                <Text>{data.jobPreference}</Text>
              </View>
            </View>
          </View>

          {/* 右列: 学歴・職歴 + 資格 */}
          <View style={styles.halfWidth}>
            {/* 学歴・職歴テーブル */}
            <View style={styles.table}>
              <View style={[styles.historyRow, { backgroundColor: "#f5f5f5" }]}>
                <View style={[styles.yearCell, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>年</Text>
                </View>
                <View style={[styles.monthCell, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>月</Text>
                </View>
                <View style={[styles.historyContent, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>学　歴・職　歴（各別にまとめて書く）</Text>
                </View>
              </View>
              {rows.map((r, i) => (
                <View key={i} style={styles.historyRow}>
                  <View style={styles.yearCell}>
                    <Text>{r.year > 0 ? r.year : ""}</Text>
                  </View>
                  <View style={styles.monthCell}>
                    <Text>{r.month > 0 ? padMonth(r.month) : ""}</Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text>{r.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 資格・免許 */}
            <View style={[styles.table, { marginTop: 8 }]}>
              <View style={[styles.historyRow, { backgroundColor: "#f5f5f5" }]}>
                <View style={[styles.yearCell, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>年</Text>
                </View>
                <View style={[styles.monthCell, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>月</Text>
                </View>
                <View style={[styles.historyContent, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ fontWeight: "bold" }}>資　格・免　許</Text>
                </View>
              </View>
              {certRows.map((c, i) => (
                <View key={i} style={styles.historyRow}>
                  <View style={styles.yearCell}>
                    <Text>{c.year > 0 ? c.year : ""}</Text>
                  </View>
                  <View style={styles.monthCell}>
                    <Text>{c.month > 0 ? padMonth(c.month) : ""}</Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text>{c.name}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.smallText, { marginTop: 4 }]}>
              ※「性別」欄：記載は任意です。未記載とすることも可能です。
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
