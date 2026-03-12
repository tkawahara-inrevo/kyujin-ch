import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export default async function PricesPage() {
  const priceEntries = await prisma.priceEntry.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
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
    <main className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <div className="mx-auto max-w-[960px] px-4 py-10 md:px-6">
        <h1 className="text-[28px] font-bold text-[#222]">料金表</h1>
        <p className="mt-2 text-[13px] text-[#888]">
          応募1件あたりの課金単価（税抜）です。
        </p>

        <div className="mt-8 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                <th className="px-5 py-3 text-left font-semibold text-[#333]" />
                <th className="w-[120px] px-5 py-3 text-right font-bold text-[#1e3a5f]">経験者</th>
                <th className="w-[120px] px-5 py-3 text-right font-bold text-[#dc2626]">未経験者</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <CategoryRows key={category} category={category} entries={grouped[category]} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function CategoryRows({
  category,
  entries,
}: {
  category: string;
  entries: { id: string; subcategory: string; experiencedPrice: number; inexperiencedPrice: number | null }[];
}) {
  return (
    <>
      <tr className="bg-[#eef2ff]">
        <td colSpan={3} className="px-5 py-2.5 text-[13px] font-bold text-[#1e3a5f]">
          {category}
        </td>
      </tr>
      {entries.map((entry) => (
        <tr key={entry.id} className="border-b border-[#f0f0f0] hover:bg-[#fafbff]">
          <td className="py-2.5 pl-10 pr-5 text-[#555]">{entry.subcategory}</td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            ¥{entry.experiencedPrice.toLocaleString()}
          </td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            {entry.inexperiencedPrice ? `¥${entry.inexperiencedPrice.toLocaleString()}` : ""}
          </td>
        </tr>
      ))}
    </>
  );
}
