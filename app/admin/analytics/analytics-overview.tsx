type TrendPoint = {
  date: string;
  views: number;
  applications: number;
};

type CategoryRow = {
  category: string;
  jobsCount: number;
  views: number;
  applications: number;
  cvrLabel: string;
};

function TrendChart({
  title,
  color,
  data,
  keyName,
}: {
  title: string;
  color: string;
  data: TrendPoint[];
  keyName: "views" | "applications";
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h3 className="text-[15px] font-bold text-[#1e293b]">{title}</h3>
        <p className="mt-6 text-[13px] text-[#94a3b8]">集計データがありません</p>
      </div>
    );
  }

  const chartW = 520;
  const chartH = 180;
  const padL = 32;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxValue = Math.max(...data.map((point) => point[keyName]), 1);

  const points = data.map((point, index) => {
    const x = padL + (index / Math.max(data.length - 1, 1)) * innerW;
    const y = padT + innerH - (point[keyName] / maxValue) * innerH;
    return { x, y, value: point[keyName], date: point.date };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padT + innerH} L${points[0].x},${padT + innerH} Z`;
  const yTicks = Array.from(new Set([0, Math.ceil(maxValue / 2), maxValue]));
  const xStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="text-[15px] font-bold text-[#1e293b]">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full min-w-[480px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {yTicks.map((tick, index) => {
            const y = padT + innerH - (tick / maxValue) * innerH;
            return (
              <g key={`${title}-tick-${tick}-${index}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={chartW - padR}
                  y2={y}
                  stroke="#eef2f7"
                  strokeWidth={1}
                />
                <text
                  x={padL - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#94a3b8"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`${color}18`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} />

          {points.map((point) => (
            <circle key={`${title}-${point.date}`} cx={point.x} cy={point.y} r={2.5} fill={color} />
          ))}

          {points.map((point, index) =>
            index % xStep === 0 || index === points.length - 1 ? (
              <text
                key={`${title}-label-${point.date}`}
                x={point.x}
                y={chartH - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
              >
                {point.date.slice(5)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}

export function AnalyticsOverview({
  trends,
  categoryRows,
}: {
  trends: TrendPoint[];
  categoryRows: CategoryRow[];
}) {
  return (
    <>
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <TrendChart title="30日間のPV推移" color="#2f6cff" data={trends} keyName="views" />
        <TrendChart
          title="30日間の応募推移"
          color="#10b981"
          data={trends}
          keyName="applications"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">カテゴリ別の反応</h2>
        <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="md:hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
              <span className="truncate">カテゴリ</span>
              <span className="text-right">PV</span>
              <span className="text-right">CVR</span>
            </div>
            <div>
              {categoryRows.map((row) => (
                <div
                  key={row.category}
                  className="grid grid-cols-[minmax(0,1fr)_64px_64px] gap-2 border-b border-[#f8f8f8] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#333]">{row.category}</p>
                    <p className="truncate text-[11px] text-[#999]">
                      求人 {row.jobsCount} / 応募 {row.applications}
                    </p>
                  </div>
                  <span className="text-right text-[13px] text-[#555]">
                    {row.views.toLocaleString()}
                  </span>
                  <span className="text-right text-[13px] font-bold text-[#10b981]">
                    {row.cvrLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[#888]">
                  <th className="px-5 py-3 font-semibold">カテゴリ</th>
                  <th className="px-5 py-3 font-semibold">求人数</th>
                  <th className="px-5 py-3 font-semibold">累計PV</th>
                  <th className="px-5 py-3 font-semibold">累計応募</th>
                  <th className="px-5 py-3 font-semibold">CVR</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.category} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">{row.category}</td>
                    <td className="px-5 py-3 text-[#555]">{row.jobsCount}</td>
                    <td className="px-5 py-3 text-[#555]">{row.views.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#555]">{row.applications}</td>
                    <td className="px-5 py-3 font-medium text-[#10b981]">{row.cvrLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
