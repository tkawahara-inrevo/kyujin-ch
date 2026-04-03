"use client";

import type { WorkingHoursDetail } from "@/lib/job-pending";

export const WORKING_HOURS_TYPES = [
  "固定時間制",
  "シフト制",
  "フレックスタイム制",
  "裁量労働制",
  "変形労働制",
  "勤務時間を指定しない",
] as const;

export type WorkingHoursType = (typeof WORKING_HOURS_TYPES)[number] | "";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const WORK_HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => String(i).padStart(2, "0")); // 00–12
const MIN_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const FLEX_PERIOD_OPTIONS = ["1週間", "1ヶ月", "3ヶ月"];
const VARIABLE_PERIOD_OPTIONS = ["1週間", "1ヶ月", "3ヶ月", "1年"];
const DISCRETIONARY_TYPES = ["専門業務型", "企画業務型", "事業場外みなし労働時間制"];

const SHIFT_NOTE_TEMPLATE = `シフト例\n・○○時○○分～○○時○○分\n・○○時○○分～○○時○○分`;

export type WorkingHoursState = {
  type: WorkingHoursType;
  scheduledStartH: string;
  scheduledStartM: string;
  scheduledEndH: string;
  scheduledEndM: string;
  maxH: string;
  maxM: string;
  separateContract: boolean;
  hasCoretime: boolean | null;
  coretimeStartH: string;
  coretimeStartM: string;
  coretimeEndH: string;
  coretimeEndM: string;
  standardPeriod: string;
  standardH: string;
  standardM: string;
  discretionaryType: string;
  notionalH: string;
  notionalM: string;
  variablePeriod: string;
  variableH: string;
  variableM: string;
  note: string;
};

export const DEFAULT_WORKING_HOURS_STATE: WorkingHoursState = {
  type: "",
  scheduledStartH: "09",
  scheduledStartM: "00",
  scheduledEndH: "18",
  scheduledEndM: "00",
  maxH: "08",
  maxM: "00",
  separateContract: false,
  hasCoretime: null,
  coretimeStartH: "10",
  coretimeStartM: "00",
  coretimeEndH: "15",
  coretimeEndM: "00",
  standardPeriod: "",
  standardH: "8",
  standardM: "00",
  discretionaryType: "",
  notionalH: "08",
  notionalM: "00",
  variablePeriod: "",
  variableH: "8",
  variableM: "00",
  note: "",
};

export function workingHoursStateFromDetail(
  type: string | null | undefined,
  detail: WorkingHoursDetail | null | undefined,
): WorkingHoursState {
  if (!type) return DEFAULT_WORKING_HOURS_STATE;
  const d = detail ?? ({} as Partial<WorkingHoursDetail>);
  return {
    type: (WORKING_HOURS_TYPES as readonly string[]).includes(type) ? (type as WorkingHoursType) : "",
    scheduledStartH: d.scheduledStartHour != null ? String(d.scheduledStartHour).padStart(2, "0") : "09",
    scheduledStartM: d.scheduledStartMin != null ? String(d.scheduledStartMin).padStart(2, "0") : "00",
    scheduledEndH: d.scheduledEndHour != null ? String(d.scheduledEndHour).padStart(2, "0") : "18",
    scheduledEndM: d.scheduledEndMin != null ? String(d.scheduledEndMin).padStart(2, "0") : "00",
    maxH: d.maxWorkHour != null ? String(d.maxWorkHour).padStart(2, "0") : "08",
    maxM: d.maxWorkMin != null ? String(d.maxWorkMin).padStart(2, "0") : "00",
    separateContract: d.separateContract ?? false,
    hasCoretime: d.hasCoretime ?? null,
    coretimeStartH: d.coretimeStartHour != null ? String(d.coretimeStartHour).padStart(2, "0") : "10",
    coretimeStartM: d.coretimeStartMin != null ? String(d.coretimeStartMin).padStart(2, "0") : "00",
    coretimeEndH: d.coretimeEndHour != null ? String(d.coretimeEndHour).padStart(2, "0") : "15",
    coretimeEndM: d.coretimeEndMin != null ? String(d.coretimeEndMin).padStart(2, "0") : "00",
    standardPeriod: d.standardWorkPeriod ?? "",
    standardH: d.standardWorkHour != null ? String(d.standardWorkHour) : "8",
    standardM: d.standardWorkMin != null ? String(d.standardWorkMin).padStart(2, "0") : "00",
    discretionaryType: d.discretionaryType ?? "",
    notionalH: d.variableWorkHour != null ? String(d.variableWorkHour).padStart(2, "0") : "08",
    notionalM: d.variableWorkMin != null ? String(d.variableWorkMin).padStart(2, "0") : "00",
    variablePeriod: d.variablePeriod ?? "",
    variableH: d.variableWorkHour != null ? String(d.variableWorkHour) : "8",
    variableM: d.variableWorkMin != null ? String(d.variableWorkMin).padStart(2, "0") : "00",
    note: d.note ?? "",
  };
}

export function workingHoursStateToData(s: WorkingHoursState): {
  workingHoursType: string | undefined;
  workingHoursDetail: WorkingHoursDetail | undefined;
} {
  if (!s.type) return { workingHoursType: undefined, workingHoursDetail: undefined };
  const detail: WorkingHoursDetail = {
    scheduledStartHour: s.type === "固定時間制" ? Number(s.scheduledStartH) : null,
    scheduledStartMin: s.type === "固定時間制" ? Number(s.scheduledStartM) : null,
    scheduledEndHour: s.type === "固定時間制" ? Number(s.scheduledEndH) : null,
    scheduledEndMin: s.type === "固定時間制" ? Number(s.scheduledEndM) : null,
    maxWorkHour: ["固定時間制", "シフト制"].includes(s.type) ? Number(s.maxH) : s.type === "裁量労働制" ? Number(s.notionalH) : null,
    maxWorkMin: ["固定時間制", "シフト制"].includes(s.type) ? Number(s.maxM) : s.type === "裁量労働制" ? Number(s.notionalM) : null,
    separateContract: ["固定時間制", "シフト制"].includes(s.type) ? s.separateContract : false,
    hasCoretime: s.type === "フレックスタイム制" ? s.hasCoretime : null,
    coretimeStartHour: s.type === "フレックスタイム制" && s.hasCoretime ? Number(s.coretimeStartH) : null,
    coretimeStartMin: s.type === "フレックスタイム制" && s.hasCoretime ? Number(s.coretimeStartM) : null,
    coretimeEndHour: s.type === "フレックスタイム制" && s.hasCoretime ? Number(s.coretimeEndH) : null,
    coretimeEndMin: s.type === "フレックスタイム制" && s.hasCoretime ? Number(s.coretimeEndM) : null,
    standardWorkPeriod: s.type === "フレックスタイム制" ? s.standardPeriod || null : null,
    standardWorkHour: s.type === "フレックスタイム制" ? Number(s.standardH) : null,
    standardWorkMin: s.type === "フレックスタイム制" ? Number(s.standardM) : null,
    discretionaryType: s.type === "裁量労働制" ? s.discretionaryType || null : null,
    variablePeriod: s.type === "変形労働制" ? s.variablePeriod || null : null,
    variableWorkHour: s.type === "変形労働制" ? Number(s.variableH) : null,
    variableWorkMin: s.type === "変形労働制" ? Number(s.variableM) : null,
    note: s.note,
  };
  return { workingHoursType: s.type, workingHoursDetail: detail };
}

const inputCls = "rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[14px] text-[#333] focus:border-[#1d63e3] focus:outline-none";
const selectCls = `${inputCls} bg-white`;
const textareaCls = `${inputCls} w-full resize-y`;
const noteCls = "mt-1 text-[12px] text-[#eb0937]";

function HourMinSelect({
  hour, min, onHourChange, onMinChange, hourOpts = HOUR_OPTIONS, label,
}: {
  hour: string; min: string;
  onHourChange: (v: string) => void;
  onMinChange: (v: string) => void;
  hourOpts?: string[];
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="shrink-0 text-[14px] text-[#555]">{label}</span>}
      <select value={hour} onChange={(e) => onHourChange(e.target.value)} className={`${selectCls} w-[64px]`}>
        {hourOpts.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-[14px] text-[#555]">時</span>
      <span className="text-[14px] text-[#555]">:</span>
      <select value={min} onChange={(e) => onMinChange(e.target.value)} className={`${selectCls} w-[64px]`}>
        {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <span className="text-[14px] text-[#555]">分</span>
    </div>
  );
}

function WorkTimeNotes() {
  return (
    <div className="space-y-0.5 text-[12px] text-[#eb0937]">
      <p>※ 実働時間（休憩時間を除いた稼働時間）の上限は1日あたり最大8時間です。</p>
      <p>※ 8時間以上にわたる場合は備考欄に詳細を記載してください。</p>
    </div>
  );
}

export function WorkingHoursSection({
  value,
  onChange,
  inputCls: _inputCls,
}: {
  value: WorkingHoursState;
  onChange: (updates: Partial<WorkingHoursState>) => void;
  inputCls?: string;
}) {
  const type = value.type;

  return (
    <div className="space-y-5">
      {/* タイプ選択 */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        {WORKING_HOURS_TYPES.map((t) => (
          <label key={t} className="flex cursor-pointer items-center gap-2 text-[15px]">
            <input
              type="radio"
              checked={type === t}
              onChange={() => onChange({ type: t })}
              className="h-[18px] w-[18px] accent-[#1d63e3]"
            />
            {t}
          </label>
        ))}
      </div>

      {/* 固定時間制 */}
      {type === "固定時間制" && (
        <div className="space-y-4 rounded-[10px] border border-[#e0e8f5] bg-[#f8fbff] p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">想定勤務時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <HourMinSelect
                hour={value.scheduledStartH} min={value.scheduledStartM}
                onHourChange={(v) => onChange({ scheduledStartH: v })}
                onMinChange={(v) => onChange({ scheduledStartM: v })}
              />
              <span className="text-[14px] text-[#555]">〜</span>
              <HourMinSelect
                hour={value.scheduledEndH} min={value.scheduledEndM}
                onHourChange={(v) => onChange({ scheduledEndH: v })}
                onMinChange={(v) => onChange({ scheduledEndM: v })}
              />
              <span className="text-[14px] text-[#555]">まで</span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">実働時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-[#555]">1日あたり最大</span>
              <select value={value.maxH} onChange={(e) => onChange({ maxH: e.target.value })} className={`${selectCls} w-[64px]`}>
                {WORK_HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">時間</span>
              <select value={value.maxM} onChange={(e) => onChange({ maxM: e.target.value })} className={`${selectCls} w-[64px]`}>
                {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">分</span>
            </div>
            <WorkTimeNotes />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#333]">
            <input type="checkbox" checked={value.separateContract} onChange={(e) => onChange({ separateContract: e.target.checked })} className="h-4 w-4 accent-[#1d63e3]" />
            労働時間に関して別途契約を締結する
          </label>
        </div>
      )}

      {/* シフト制 */}
      {type === "シフト制" && (
        <div className="space-y-4 rounded-[10px] border border-[#e0e8f5] bg-[#f8fbff] p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">実働時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-[#555]">1日あたり最大</span>
              <select value={value.maxH} onChange={(e) => onChange({ maxH: e.target.value })} className={`${selectCls} w-[64px]`}>
                {WORK_HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">時間</span>
              <select value={value.maxM} onChange={(e) => onChange({ maxM: e.target.value })} className={`${selectCls} w-[64px]`}>
                {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">分</span>
            </div>
            <WorkTimeNotes />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#333]">
            <input type="checkbox" checked={value.separateContract} onChange={(e) => onChange({ separateContract: e.target.checked })} className="h-4 w-4 accent-[#1d63e3]" />
            労働時間に関して別途契約を締結する
          </label>
        </div>
      )}

      {/* フレックスタイム制 */}
      {type === "フレックスタイム制" && (
        <div className="space-y-4 rounded-[10px] border border-[#e0e8f5] bg-[#f8fbff] p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">コアタイム <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 flex-wrap">
                <span className="flex items-center gap-2">
                  <input type="radio" checked={value.hasCoretime === true} onChange={() => onChange({ hasCoretime: true })} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                  <span className="text-[14px]">あり</span>
                </span>
                {value.hasCoretime === true && (
                  <div className="flex flex-wrap items-center gap-2">
                    <HourMinSelect
                      hour={value.coretimeStartH} min={value.coretimeStartM}
                      onHourChange={(v) => onChange({ coretimeStartH: v })}
                      onMinChange={(v) => onChange({ coretimeStartM: v })}
                    />
                    <span className="text-[14px] text-[#555]">〜</span>
                    <HourMinSelect
                      hour={value.coretimeEndH} min={value.coretimeEndM}
                      onHourChange={(v) => onChange({ coretimeEndH: v })}
                      onMinChange={(v) => onChange({ coretimeEndM: v })}
                    />
                    <span className="text-[14px] text-[#555]">まで</span>
                  </div>
                )}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[14px]">
                <input type="radio" checked={value.hasCoretime === false} onChange={() => onChange({ hasCoretime: false })} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                なし（フルフレックス）
              </label>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">標準労働時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <select value={value.standardPeriod} onChange={(e) => onChange({ standardPeriod: e.target.value })} className={`${selectCls} min-w-[120px]`}>
                <option value="">選択してください</option>
                {FLEX_PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">あたり</span>
              <input
                type="number"
                min={1}
                max={40}
                value={value.standardH}
                onChange={(e) => onChange({ standardH: e.target.value })}
                className={`${inputCls} w-[64px]`}
              />
              <span className="text-[14px] text-[#555]">時間</span>
              <select value={value.standardM} onChange={(e) => onChange({ standardM: e.target.value })} className={`${selectCls} w-[64px]`}>
                {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">分</span>
            </div>
          </div>
        </div>
      )}

      {/* 裁量労働制 */}
      {type === "裁量労働制" && (
        <div className="space-y-4 rounded-[10px] border border-[#e0e8f5] bg-[#f8fbff] p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">制度 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap gap-6">
              {DISCRETIONARY_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-[14px]">
                  <input type="radio" checked={value.discretionaryType === t} onChange={() => onChange({ discretionaryType: t })} className="h-[18px] w-[18px] accent-[#1d63e3]" />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">みなし労働時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-[#555]">1日あたり</span>
              <select value={value.notionalH} onChange={(e) => onChange({ notionalH: e.target.value })} className={`${selectCls} w-[64px]`}>
                {WORK_HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">時間</span>
              <select value={value.notionalM} onChange={(e) => onChange({ notionalM: e.target.value })} className={`${selectCls} w-[64px]`}>
                {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">分</span>
            </div>
            <WorkTimeNotes />
          </div>
        </div>
      )}

      {/* 変形労働制 */}
      {type === "変形労働制" && (
        <div className="space-y-4 rounded-[10px] border border-[#e0e8f5] bg-[#f8fbff] p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[#333]">平均労働時間 <span className="ml-1 rounded bg-[#eb0937] px-1.5 py-0.5 text-[11px] text-white">必須</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <select value={value.variablePeriod} onChange={(e) => onChange({ variablePeriod: e.target.value })} className={`${selectCls} min-w-[120px]`}>
                <option value="">選択してください</option>
                {VARIABLE_PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">あたり 平均</span>
              <input
                type="number"
                min={1}
                max={40}
                value={value.variableH}
                onChange={(e) => onChange({ variableH: e.target.value })}
                className={`${inputCls} w-[64px]`}
              />
              <span className="text-[14px] text-[#555]">時間</span>
              <select value={value.variableM} onChange={(e) => onChange({ variableM: e.target.value })} className={`${selectCls} w-[64px]`}>
                {MIN_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-[14px] text-[#555]">分</span>
            </div>
            <WorkTimeNotes />
          </div>
        </div>
      )}

      {/* 備考（全タイプ共通） */}
      {type && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#333]">備考 <span className="ml-1 text-[12px] font-normal text-[#7b8797]">任意</span></p>
            {type === "シフト制" && (
              <button
                type="button"
                onClick={() => onChange({ note: SHIFT_NOTE_TEMPLATE })}
                className="rounded-[8px] bg-[#00b8a9] px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
              >
                カンタン入力
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={value.note}
            onChange={(e) => onChange({ note: e.target.value })}
            className={textareaCls}
            placeholder="例）◎実働8時間・休憩1時間&#10;◎残業は月平均20時間程度です。"
            maxLength={150}
          />
          <p className="mt-1 text-right text-[12px] text-[#7b8797]">{value.note.length} / 150文字</p>
        </div>
      )}
    </div>
  );
}
