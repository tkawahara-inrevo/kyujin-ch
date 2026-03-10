const infoItems = [
  ["所在地", "＊＊＊＊＊＊＊＊＊＊＊＊＊＊"],
  ["設立", "1960年3月"],
  ["従業員数", "100名"],
  ["市場", "東証　売上場"],
  ["資本金", "＊＊＊万円"],
  ["売上高", "＊＊＊万円"],
  ["平均年齢", "＊＊才"],
];

export function CompanyInfoTable() {
  return (
    <section className="mt-10">
      <div className="bg-[#2f6cff] px-4 py-2 text-[14px] font-bold text-white">
        会社情報
      </div>

      <div className="bg-white px-4 py-6">
        <div className="space-y-5">
          {infoItems.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 border-b border-[#eeeeee] pb-4 text-[13px] text-[#444] md:grid-cols-[90px_1fr]"
            >
              <p className="font-bold text-[#333]">{label}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}