import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "./types";
import { registerNotoSansJP } from "./font-loader";

registerNotoSansJP();

const BORDER = { borderWidth: 0.5, borderColor: "#333" };
const LABEL_BG = { backgroundColor: "#f0f0f0" };

const s = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 7.5, padding: 14, backgroundColor: "#fff" },
  row2: { flexDirection: "row" },
  // ---- 左列 ----
  leftCol: { flex: 44, marginRight: 7 },
  // ---- 右列 ----
  rightCol: { flex: 56 },
  // ---- 基本情報テーブル ----
  infoTable: { borderStyle: "solid", borderWidth: 0.5, borderColor: "#333" },
  infoRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#333", borderBottomStyle: "solid" },
  infoLastRow: { flexDirection: "row" },
  labelCell: { ...LABEL_BG, justifyContent: "center", alignItems: "flex-start", padding: 3, borderRightWidth: 0.5, borderRightColor: "#333", borderRightStyle: "solid" },
  valueCell: { justifyContent: "center", padding: 3, borderRightWidth: 0.5, borderRightColor: "#333", borderRightStyle: "solid" },
  valueCellLast: { justifyContent: "center", padding: 3 },
  // ---- 学歴・職歴テーブル ----
  histTable: { borderStyle: "solid", borderWidth: 0.5, borderColor: "#333", marginTop: 4 },
  histHeaderRow: { flexDirection: "row", ...LABEL_BG, borderBottomWidth: 0.5, borderBottomColor: "#333", borderBottomStyle: "solid" },
  histRow: { flexDirection: "row", borderBottomWidth: 0.3, borderBottomColor: "#aaa", borderBottomStyle: "solid", minHeight: 14 },
  yrCell: { width: 26, borderRightWidth: 0.3, borderRightColor: "#aaa", borderRightStyle: "solid", padding: 2, justifyContent: "center", alignItems: "center" },
  moCell: { width: 17, borderRightWidth: 0.3, borderRightColor: "#aaa", borderRightStyle: "solid", padding: 2, justifyContent: "center", alignItems: "center" },
  contentCell: { flex: 1, padding: 2, justifyContent: "center" },
  // ---- 資格テーブル ----
  certTable: { borderStyle: "solid", borderWidth: 0.5, borderColor: "#333", marginTop: 6 },
  // ---- テキストボックス ----
  boxLabel: { ...LABEL_BG, borderWidth: 0.5, borderColor: "#333", borderStyle: "solid", padding: "2 3", fontSize: 6.5, color: "#444", marginTop: 5 },
  textBox: { borderWidth: 0.5, borderColor: "#333", borderStyle: "solid", borderTopWidth: 0, padding: 4 },
  // ---- タイトル ----
  title: { fontSize: 17, fontWeight: "bold", letterSpacing: 8 },
  bigName: { fontSize: 13, fontWeight: "bold" },
  small: { fontSize: 6, color: "#666" },
});

function pad(n: number) { return String(n).padStart(2, "0"); }

function calcAge(d: string) {
  if (!d) return 0;
  const b = new Date(d), t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
}

function fmtDate(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
}

const ROWS_LEFT = 14;
const ROWS_RIGHT_HIST = 6;
const CERT_ROWS = 6;

export function ResumePDF({ data }: { data: ResumeData }) {
  const today = new Date();
  const address = [data.postalCode ? `〒${data.postalCode}` : "", data.prefecture, data.cityTown, data.addressLine].filter(Boolean).join(" ");

  // 学歴・職歴行を構築
  type HRow = { year: number | null; month: number | null; text: string; bold?: boolean };
  const histRows: HRow[] = [];
  if (data.educations.length > 0) {
    histRows.push({ year: null, month: null, text: "学　　歴", bold: true });
    for (const e of data.educations) {
      histRows.push({ year: e.year, month: e.month, text: `${e.schoolName}${e.faculty ? ` ${e.faculty}` : ""}　${e.status}` });
    }
  }
  if (data.workExperiences.length > 0) {
    histRows.push({ year: null, month: null, text: "職　　歴", bold: true });
    for (const w of data.workExperiences) {
      histRows.push({ year: w.startYear, month: w.startMonth, text: `${w.companyName}${w.department ? `　${w.department}` : ""}　入社` });
      if (!w.isCurrent && w.endYear && w.endMonth) {
        histRows.push({ year: w.endYear, month: w.endMonth, text: `${w.companyName}　退社` });
      }
    }
    histRows.push({ year: null, month: null, text: "以　上" });
  }

  // 左列に表示する行（最大 ROWS_LEFT 行）
  const leftRows = histRows.slice(0, ROWS_LEFT);
  while (leftRows.length < ROWS_LEFT) leftRows.push({ year: null, month: null, text: "" });

  // 右列上部に表示する行（続き、最大 ROWS_RIGHT_HIST 行）
  const rightRows = histRows.slice(ROWS_LEFT);
  while (rightRows.length < ROWS_RIGHT_HIST) rightRows.push({ year: null, month: null, text: "" });

  // 資格行
  const certRows = [...data.certifications];
  while (certRows.length < CERT_ROWS) certRows.push({ name: "", year: 0, month: 0, sortOrder: 0 });

  const HistHeader = () => (
    <View style={s.histHeaderRow}>
      <View style={[s.yrCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>年</Text></View>
      <View style={[s.moCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>月</Text></View>
      <View style={[s.contentCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>学　歴・職　歴（各別にまとめて書く）</Text></View>
    </View>
  );

  const HistRow = ({ r }: { r: HRow }) => (
    <View style={s.histRow}>
      <View style={s.yrCell}><Text>{r.year ?? ""}</Text></View>
      <View style={s.moCell}><Text>{r.month ? pad(r.month) : ""}</Text></View>
      <View style={s.contentCell}><Text style={r.bold ? { fontWeight: "bold" } : {}}>{r.text}</Text></View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.row2}>

          {/* ======== 左列 ======== */}
          <View style={s.leftCol}>
            {/* タイトル行 */}
            <View style={[s.row2, { justifyContent: "space-between", alignItems: "flex-end", marginBottom: 3 }]}>
              <Text style={s.title}>履　歴　書</Text>
              <Text style={{ fontSize: 7.5 }}>{today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日現在</Text>
            </View>

            {/* 基本情報 + 写真 */}
            <View style={s.row2}>
              {/* 情報テーブル */}
              <View style={[s.infoTable, { flex: 1 }]}>
                {/* ふりがな */}
                <View style={s.infoRow}>
                  <View style={[s.labelCell, { width: 38 }]}><Text>ふりがな</Text></View>
                  <View style={[s.valueCellLast, { flex: 1 }]}><Text>{data.lastNameKana}　{data.firstNameKana}</Text></View>
                </View>
                {/* 氏名 */}
                <View style={s.infoRow}>
                  <View style={[s.labelCell, { width: 38 }]}><Text>氏　名</Text></View>
                  <View style={[s.valueCellLast, { flex: 1 }]}>
                    <Text style={s.bigName}>{data.lastName}　{data.firstName}</Text>
                  </View>
                </View>
                {/* 生年月日・性別 */}
                <View style={s.infoRow}>
                  <View style={[s.labelCell, { width: 38 }]}><Text>生年月日</Text></View>
                  <View style={[s.valueCell, { flex: 1 }]}>
                    <Text>{fmtDate(data.birthDate)}　（満{calcAge(data.birthDate)}歳）</Text>
                  </View>
                  <View style={[s.labelCell, { width: 20 }]}><Text>性別</Text></View>
                  <View style={[s.valueCellLast, { width: 28 }]}><Text>{data.gender}</Text></View>
                </View>
                {/* 電話・ふりがな住所 */}
                <View style={s.infoRow}>
                  <View style={[s.labelCell, { width: 38 }]}><Text>ふりがな</Text></View>
                  <View style={[s.valueCell, { flex: 1 }]}><Text></Text></View>
                  <View style={[s.labelCell, { width: 24 }]}><Text>電話</Text></View>
                  <View style={[s.valueCellLast, { width: 68 }]}><Text>{data.phone}</Text></View>
                </View>
                {/* 住所・Email */}
                <View style={s.infoLastRow}>
                  <View style={[s.labelCell, { width: 38 }]}><Text>現住所 〒</Text></View>
                  <View style={[s.valueCell, { flex: 1 }]}><Text style={{ fontSize: 7 }}>{address}</Text></View>
                  <View style={[s.labelCell, { width: 24 }]}><Text>E-mail</Text></View>
                  <View style={[s.valueCellLast, { width: 68 }]}><Text style={{ fontSize: 6.5 }}>{data.email}</Text></View>
                </View>
              </View>

              {/* 写真エリア */}
              <View style={{ width: 54, height: 72, borderWidth: 0.5, borderColor: "#999", marginLeft: 4, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 5.5, color: "#888", textAlign: "center" }}>写真をはる位置</Text>
              </View>
            </View>

            {/* 学歴・職歴テーブル（左列） */}
            <View style={s.histTable}>
              <HistHeader />
              {leftRows.map((r, i) => <HistRow key={i} r={r} />)}
            </View>
          </View>

          {/* ======== 右列 ======== */}
          <View style={s.rightCol}>
            {/* 学歴・職歴テーブル（続き） */}
            <View style={[s.histTable, { marginTop: 0 }]}>
              <HistHeader />
              {rightRows.map((r, i) => <HistRow key={i} r={r} />)}
            </View>

            {/* 資格・免許 */}
            <View style={[s.certTable, { marginTop: 5 }]}>
              <View style={s.histHeaderRow}>
                <View style={[s.yrCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>年</Text></View>
                <View style={[s.moCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>月</Text></View>
                <View style={[s.contentCell, LABEL_BG]}><Text style={{ fontWeight: "bold" }}>資　格・免　許</Text></View>
              </View>
              {certRows.map((c, i) => (
                <View key={i} style={s.histRow}>
                  <View style={s.yrCell}><Text>{c.year > 0 ? c.year : ""}</Text></View>
                  <View style={s.moCell}><Text>{c.month > 0 ? pad(c.month) : ""}</Text></View>
                  <View style={s.contentCell}><Text>{c.name}</Text></View>
                </View>
              ))}
            </View>

            {/* 志望動機・アピールポイント */}
            <Text style={s.boxLabel}>志望の動機、特技、好きな学科、アピールポイントなど</Text>
            <View style={[s.textBox, { minHeight: 72 }]}>
              <Text style={{ fontSize: 8, lineHeight: 1.7 }}>{data.prText}</Text>
            </View>

            {/* 本人希望欄 */}
            <Text style={s.boxLabel}>本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</Text>
            <View style={[s.textBox, { minHeight: 38 }]}>
              <Text style={{ fontSize: 8, lineHeight: 1.7 }}>{data.jobPreference}</Text>
            </View>

            {/* 注記 */}
            <Text style={[s.small, { marginTop: 3, color: "#555" }]}>
              ※「性別」欄：記載は任意です。未記載とすることも可能です。
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
