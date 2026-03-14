"use client";

import { useState, useEffect } from "react";

type DayCount = { date: string; count: number };

export default function ApplicationChart({ jobId }: { jobId: string }) {
  const [data, setData] = useState<DayCount[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/company/analytics/applications?jobId=${jobId}`)
      .then((res) => res.json())
      .then((d: DayCount[]) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[13px] text-[#aaa]">
        読み込み中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[13px] text-[#aaa]">
        データがありません
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const chartW = 700;
  const chartH = 140;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const points = data.map((d, i) => {
    const x = padL + (i / (data.length - 1 || 1)) * innerW;
    const y = padT + innerH - (d.count / maxCount) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + innerH} L${points[0].x},${padT + innerH} Z`;

  // Y-axis labels
  const yTicks = Array.from(new Set([0, Math.ceil(maxCount / 2), maxCount]));

  // X-axis labels (show ~6 labels)
  const xStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="overflow-x-auto px-2 py-3">
      <p className="mb-2 text-[12px] font-semibold text-[#888]">直近30日間の応募数</p>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[700px]" preserveAspectRatio="xMidYMid meet">
        {/* grid lines */}
        {yTicks.map((tick, index) => {
          const y = padT + innerH - (tick / maxCount) * innerH;
          return (
            <g key={`y-tick-${tick}-${index}`}>
              <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#aaa">
                {tick}
              </text>
            </g>
          );
        })}

        {/* area fill */}
        <path d={areaPath} fill="rgba(47,108,255,0.08)" />

        {/* line */}
        <path d={linePath} fill="none" stroke="#2f6cff" strokeWidth={2} strokeLinejoin="round" />

        {/* dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#2f6cff" />
        ))}

        {/* x-axis labels */}
        {data.map((d, i) =>
          i % xStep === 0 || i === data.length - 1 ? (
            <text key={i} x={points[i].x} y={chartH - 4} textAnchor="middle" fontSize={9} fill="#aaa">
              {d.date.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
