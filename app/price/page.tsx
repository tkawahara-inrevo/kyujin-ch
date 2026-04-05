import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "料金表 | 求人ちゃんねる",
};

export default async function PricePage() {
  const priceEntries = await prisma.priceEntry.findMany({
    orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
  });

  const grouped: Record<string, typeof priceEntries> = {};
  const categories: string[] = [];
  for (const entry of priceEntries) {
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
      categories.push(entry.category);
    }
    grouped[entry.category].push(entry);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center text-[28px] font-bold text-gray-900">料金表</h1>
        <p className="mb-10 text-center text-[13px] text-gray-500">
          採用が決まった場合のみ費用が発生する完全成功報酬型です
        </p>

        <div className="space-y-6">
          {categories.map((category) => (
            <div
              key={category}
              className="overflow-hidden rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            >
              <div className="bg-[#1e3a5f] px-5 py-3">
                <h2 className="text-[14px] font-bold text-white">{category}</h2>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-[#888]">
                    <th className="px-5 py-2.5 text-left font-semibold">職種</th>
                    <th className="w-[160px] px-5 py-2.5 text-right font-semibold">経験者</th>
                    <th className="w-[160px] px-5 py-2.5 text-right font-semibold">未経験者</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[category].map((entry) => (
                    <tr key={entry.id} className="border-b border-[#f0f0f0] last:border-0">
                      <td className="px-5 py-2.5 text-[#555]">{entry.subcategory}</td>
                      <td className="px-5 py-2.5 text-right font-medium text-[#333]">
                        ¥{entry.experiencedPrice.toLocaleString()}
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium text-[#333]">
                        {entry.inexperiencedPrice
                          ? `¥${entry.inexperiencedPrice.toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-gray-400">
          ※ 表示金額は税抜です。別途消費税がかかります。
        </p>
      </div>
    </main>
  );
}
