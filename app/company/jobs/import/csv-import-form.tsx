"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { importJobsFromCsv, type CsvImportResult } from "@/app/actions/company/jobs-csv-import";

async function readFileAsText(file: File): Promise<string> {
  // Excel の CSV は Shift_JIS の可能性が高いのでまず UTF-8 で読み、非可読なら Shift_JIS フォールバック
  const utf8 = await file.text();
  // 文字化け検出: 置換文字 U+FFFD が含まれていたら Shift_JIS で再デコード
  if (utf8.includes("�")) {
    const buffer = await file.arrayBuffer();
    try {
      return new TextDecoder("shift-jis").decode(buffer);
    } catch {
      return utf8;
    }
  }
  return utf8;
}

type Props = {
  companyId: string;
  companyName: string;
};

export default function CsvImportForm({ companyId, companyName }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleImport() {
    if (!file) {
      setError("CSV ファイルを選択してください");
      return;
    }
    setError("");
    setResult(null);

    const text = await readFileAsText(file);

    startTransition(async () => {
      try {
        const r = await importJobsFromCsv(text, companyId);
        setResult(r);
        if (r.successCount > 0) router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "アップロードに失敗しました");
      }
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* テンプレート DL */}
      <section className="rounded-[14px] border border-[#bfdbfe] bg-[#eff6ff] p-5">
        <h2 className="text-[15px] font-bold text-[#1e40af]">1. テンプレートをダウンロード</h2>
        <p className="mt-2 text-[13px] text-[#1e40af]">
          まずテンプレート CSV をダウンロードし、Excel などで求人情報を入力してください。
          2 行目はカラムの説明なので、実データを追加する場合は3行目以降に入力してください。
        </p>
        <a
          href="/api/v1/jobs/csv-template"
          className="mt-3 inline-block rounded-[8px] bg-[#1e40af] px-5 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          📥 テンプレート CSV をダウンロード
        </a>
      </section>

      {/* アップロード */}
      <section className="rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[15px] font-bold text-[#1e293b]">2. CSV ファイルをアップロード</h2>
        <p className="mt-2 text-[13px] text-[#666]">
          対象企業: <span className="font-bold">{companyName}</span>
        </p>
        <p className="mt-1 text-[12px] text-[#888]">
          UTF-8 / Shift_JIS どちらも対応。Excel から「CSV UTF-8」または「CSV (コンマ区切り)」で保存してください。
        </p>

        <div className="mt-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded border border-[#dadfe8] px-3 py-2 text-[13px]"
          />
        </div>

        {error && <p className="mt-3 rounded bg-[#fef2f2] px-3 py-2 text-[13px] text-[#dc2626]">{error}</p>}

        <button
          type="button"
          onClick={handleImport}
          disabled={isPending || !file}
          className="mt-4 rounded-[8px] bg-[#2f6cff] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "アップロード中..." : "アップロードして下書き作成"}
        </button>
      </section>

      {/* 結果 */}
      {result && (
        <section className="rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-bold text-[#1e293b]">アップロード結果</h2>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <ResultTile label="読み取り行数" value={result.totalRows.toString()} tone="neutral" />
            <ResultTile label="成功" value={result.successCount.toString()} tone="success" />
            <ResultTile label="失敗" value={result.errorRows.length.toString()} tone={result.errorRows.length > 0 ? "danger" : "neutral"} />
          </div>

          {result.successCount > 0 && (
            <div className="mt-4 rounded bg-[#f0fdf4] px-4 py-3 text-[13px] text-[#065f46]">
              ✅ {result.successCount} 件の求人を下書きで作成しました。
              <Link href="/company/jobs" className="ml-3 font-bold underline">
                求人一覧で確認
              </Link>
            </div>
          )}

          {result.errorRows.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[13px] font-bold text-[#dc2626]">エラーが発生した行</h3>
              <p className="mt-1 text-[12px] text-[#666]">
                以下の行はスキップされました。修正した CSV を再度アップロードしてください。
              </p>
              <div className="mt-2 rounded border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px]">
                {result.errorRows.map((r) => (
                  <div key={r.rowNumber} className="mb-2 last:mb-0">
                    <p className="font-bold text-[#dc2626]">
                      {r.rowNumber} 行目 {r.titleGuess ? `「${r.titleGuess}」` : ""}
                    </p>
                    <ul className="ml-4 mt-1 list-disc text-[#7f1d1d]">
                      {r.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ResultTile({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" | "neutral" }) {
  const cls =
    tone === "success"
      ? "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]"
      : tone === "danger"
        ? "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]"
        : "bg-[#f8fafc] text-[#1e293b] border-[#e2e8f0]";
  return (
    <div className={`rounded-[10px] border p-3 text-center ${cls}`}>
      <p className="text-[11px] font-bold opacity-70">{label}</p>
      <p className="mt-1 text-[22px] font-bold">{value}</p>
    </div>
  );
}
