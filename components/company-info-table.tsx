type CompanyInfoTableProps = {
  location?: string | null;
  industry?: string | null;
  employeeCount?: string | null;
  foundedYear?: string | null;
  capital?: string | null;
  websiteUrl?: string | null;
};

export function CompanyInfoTable({
  location,
  industry,
  employeeCount,
  foundedYear,
  capital,
  websiteUrl,
}: CompanyInfoTableProps) {
  const rows = [
    { label: "所在地", value: location },
    { label: "業種", value: industry },
    { label: "従業員数", value: employeeCount },
    { label: "設立", value: foundedYear },
    { label: "資本金", value: capital },
    { label: "WEBサイト", value: websiteUrl, isUrl: true },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="bg-[#2f6cff] px-4 py-2 text-[14px] font-bold text-white">
        会社情報
      </div>

      <div className="bg-white px-4 py-6">
        <div className="space-y-5">
          {rows.map(({ label, value, isUrl }) => (
            <div
              key={label}
              className="grid gap-2 border-b border-[#eeeeee] pb-4 text-[13px] text-[#444] md:grid-cols-[90px_1fr] last:border-b-0 last:pb-0"
            >
              <p className="font-bold text-[#333]">{label}</p>
              {isUrl ? (
                <a
                  href={value!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[#2f6cff] hover:underline"
                >
                  {value}
                </a>
              ) : (
                <p>{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
