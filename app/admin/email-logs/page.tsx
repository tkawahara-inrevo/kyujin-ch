import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/auth-helpers";

const STATUS_LABELS = {
  SENT: { label: "成功", color: "#16a34a" },
  FAILED: { label: "失敗", color: "#dc2626" },
} as const;

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(d);
}

type SearchParams = Promise<{ q?: string; tag?: string; status?: string }>;

export default async function AdminEmailLogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPermission("emailLogs");
  const { q, tag, status } = await searchParams;

  const where: Parameters<typeof prisma.emailLog.findMany>[0] = {
    where: {
      ...(q ? { toAddresses: { contains: q, mode: "insensitive" as const } } : {}),
      ...(tag ? { senderTag: tag } : {}),
      ...(status === "SENT" || status === "FAILED" ? { status } : {}),
    },
    orderBy: { sentAt: "desc" },
    take: 200,
  };

  const [logs, tagGroups] = await Promise.all([
    prisma.emailLog.findMany(where),
    prisma.emailLog.groupBy({
      by: ["senderTag"],
      _count: { _all: true },
      orderBy: { senderTag: "asc" },
    }),
  ]);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">メール送信ログ</h1>
          <p className="mt-2 text-[13px] text-[#888]">
            SES 経由で送信したトランザクションメールの履歴。直近 200 件表示。
          </p>
        </div>
        <div className="rounded-[12px] bg-white px-4 py-3 text-right shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-semibold text-[#888]">表示件数</p>
          <p className="mt-1 text-[22px] font-bold text-[#2f6cff]">{logs.length}</p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-[14px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div>
          <label className="block text-[11px] font-bold text-[#888]">宛先で検索</label>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="例: example@gmail.com"
            className="mt-1 w-[260px] rounded border border-[#dadfe8] px-3 py-2 text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#888]">タグ</label>
          <select
            name="tag"
            defaultValue={tag ?? ""}
            className="mt-1 w-[200px] rounded border border-[#dadfe8] px-3 py-2 text-[13px]"
          >
            <option value="">(すべて)</option>
            {tagGroups
              .filter((g) => g.senderTag)
              .map((g) => (
                <option key={g.senderTag!} value={g.senderTag!}>
                  {g.senderTag} ({g._count._all})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#888]">状態</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 w-[140px] rounded border border-[#dadfe8] px-3 py-2 text-[13px]"
          >
            <option value="">(すべて)</option>
            <option value="SENT">成功</option>
            <option value="FAILED">失敗</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white"
        >
          絞り込む
        </button>
        {(q || tag || status) && (
          <a
            href="/admin/email-logs"
            className="rounded border border-[#dadfe8] px-4 py-2 text-[13px] font-bold text-[#444]"
          >
            クリア
          </a>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-[13px]">
          <thead className="bg-[#f8fafc]">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold text-[#666]">送信日時</th>
              <th className="px-4 py-3 font-bold text-[#666]">宛先</th>
              <th className="px-4 py-3 font-bold text-[#666]">件名</th>
              <th className="px-4 py-3 font-bold text-[#666]">タグ</th>
              <th className="px-4 py-3 font-bold text-[#666]">状態</th>
              <th className="px-4 py-3 font-bold text-[#666]">本文 (抜粋)</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#888]">
                  該当する送信ログがありません。
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const statusInfo = STATUS_LABELS[log.status];
                return (
                  <tr key={log.id} className="border-t border-[#eef2f7] align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-[#444]">
                      {formatDateTime(log.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-[#1e293b]">{log.toAddresses}</td>
                    <td className="px-4 py-3 text-[#1e293b]">{log.subject}</td>
                    <td className="px-4 py-3 text-[#666]">
                      {log.senderTag ?? <span className="text-[#bbb]">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white"
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                      {log.status === "FAILED" && log.errorText && (
                        <p className="mt-1 text-[11px] text-[#dc2626]">{log.errorText}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[400px] text-[#666]">
                      <p className="line-clamp-3 whitespace-pre-wrap">{log.bodyPreview}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
