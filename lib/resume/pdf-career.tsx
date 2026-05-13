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
    fontSize: 9,
    padding: 30,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 8,
    textAlign: "right",
    marginBottom: 16,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#2f6cff",
    color: "#ffffff",
    padding: "4 8",
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitleAlt: {
    fontSize: 10,
    fontWeight: "bold",
    borderLeftWidth: 3,
    borderLeftColor: "#2f6cff",
    paddingLeft: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  workBlock: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  workHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#2f6cff",
    paddingBottom: 3,
    marginBottom: 4,
  },
  workCompany: {
    fontSize: 10,
    fontWeight: "bold",
  },
  workPeriod: {
    fontSize: 8,
    color: "#555",
  },
  workMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  workMetaItem: {
    fontSize: 8,
    color: "#444",
  },
  workDesc: {
    fontSize: 8,
    lineHeight: 1.6,
    marginTop: 2,
  },
  bulletLine: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.5,
  },
  skillTable: {
    marginTop: 4,
  },
  skillRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: "#ddd",
    paddingVertical: 3,
  },
  skillLabel: {
    width: 100,
    fontSize: 8,
    fontWeight: "bold",
    color: "#444",
  },
  skillValue: {
    flex: 1,
    fontSize: 8,
  },
  prBox: {
    borderWidth: 0.5,
    borderColor: "#ddd",
    borderRadius: 3,
    padding: 8,
    fontSize: 8,
    lineHeight: 1.8,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    right: 30,
    fontSize: 7,
    color: "#999",
  },
});

function formatPeriod(
  startYear: number,
  startMonth: number,
  endYear: number | null,
  endMonth: number | null,
  isCurrent: boolean
): string {
  const start = `${startYear}年${startMonth}月`;
  const end = isCurrent ? "現在" : endYear ? `${endYear}年${endMonth}月` : "";
  return end ? `${start} ～ ${end}` : start;
}

function calcYears(
  startYear: number,
  startMonth: number,
  endYear: number | null,
  endMonth: number | null
): string {
  const end = endYear ? new Date(endYear, (endMonth ?? 1) - 1) : new Date();
  const start = new Date(startYear, startMonth - 1);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}年${m}ヶ月` : `${m}ヶ月`;
}

function renderDescriptionLines(desc: string) {
  if (!desc) return null;
  const lines = desc.split(/\r?\n/).filter((l) => l.trim());
  return lines.map((line, i) => (
    <View key={i} style={styles.bulletLine}>
      <Text style={styles.bullet}>・</Text>
      <Text style={styles.bulletText}>{line.replace(/^[・●▶\-\s]+/, "")}</Text>
    </View>
  ));
}

// ITエンジニア用: スキルセクション強調
function ITCareerBody({ data }: { data: ResumeData }) {
  return (
    <>
      <Text style={styles.sectionTitle}>職務経歴</Text>
      {data.workExperiences.map((w, i) => (
        <View key={i} style={styles.workBlock}>
          <View style={styles.workHeader}>
            <Text style={styles.workCompany}>{w.companyName}{w.department ? `　${w.department}` : ""}</Text>
            <Text style={styles.workPeriod}>
              {formatPeriod(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent)}
              {"　"}（{calcYears(w.startYear, w.startMonth, w.endYear, w.endMonth)}）
            </Text>
          </View>
          {w.description ? renderDescriptionLines(w.description) : null}
        </View>
      ))}
    </>
  );
}

// 営業職用: 実績・数字強調
function SalesCareerBody({ data }: { data: ResumeData }) {
  return (
    <>
      <Text style={styles.sectionTitle}>職務経歴</Text>
      {data.workExperiences.map((w, i) => (
        <View key={i} style={styles.workBlock}>
          <View style={styles.workHeader}>
            <Text style={styles.workCompany}>{w.companyName}{w.department ? `　${w.department}` : ""}</Text>
            <Text style={styles.workPeriod}>
              {formatPeriod(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent)}
            </Text>
          </View>
          <Text style={[styles.workMetaItem, { marginBottom: 4 }]}>【担当業務・実績】</Text>
          {w.description ? renderDescriptionLines(w.description) : null}
        </View>
      ))}
    </>
  );
}

// 汎用
function GeneralCareerBody({ data }: { data: ResumeData }) {
  return (
    <>
      <Text style={styles.sectionTitle}>職務経歴</Text>
      {data.workExperiences.map((w, i) => (
        <View key={i} style={styles.workBlock}>
          <View style={styles.workHeader}>
            <Text style={styles.workCompany}>{w.companyName}{w.department ? `　${w.department}` : ""}</Text>
            <Text style={styles.workPeriod}>
              {formatPeriod(w.startYear, w.startMonth, w.endYear, w.endMonth, w.isCurrent)}
              {"　"}（{calcYears(w.startYear, w.startMonth, w.endYear, w.endMonth)}）
            </Text>
          </View>
          {w.description ? renderDescriptionLines(w.description) : null}
        </View>
      ))}
    </>
  );
}

export function CareerPDF({ data }: { data: ResumeData }) {
  const today = new Date();

  const renderBody = () => {
    switch (data.careerJobType) {
      case "it_engineer": return <ITCareerBody data={data} />;
      case "sales": return <SalesCareerBody data={data} />;
      default: return <GeneralCareerBody data={data} />;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>職　務　経　歴　書</Text>
        <Text style={styles.subtitle}>
          {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日現在
          {data.lastName} {data.firstName}
        </Text>

        {/* 職務要約 */}
        <Text style={styles.sectionTitleAlt}>職務要約</Text>
        <View style={styles.prBox}>
          <Text>{data.prText || "（記入なし）"}</Text>
        </View>

        {/* 職務経歴（職種別レイアウト） */}
        {renderBody()}

        {/* 資格・免許 */}
        {data.certifications.length > 0 && (
          <>
            <Text style={[styles.sectionTitleAlt, { marginTop: 12 }]}>資格・免許</Text>
            <View style={styles.skillTable}>
              {data.certifications.map((c, i) => (
                <View key={i} style={styles.skillRow}>
                  <Text style={styles.skillLabel}>{c.year}年{c.month}月</Text>
                  <Text style={styles.skillValue}>{c.name}　取得</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 自己PR */}
        <Text style={[styles.sectionTitleAlt, { marginTop: 12 }]}>自己PR</Text>
        <View style={styles.prBox}>
          <Text>{data.prText || "（記入なし）"}</Text>
        </View>

        <Text style={styles.footer}>
          {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日現在
        </Text>
      </Page>
    </Document>
  );
}
