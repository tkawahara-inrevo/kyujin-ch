type EmptyStateCardProps = {
  title: string;
  description: string;
};

export function EmptyStateCard({
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#d7d7d7] bg-white px-6 py-12 text-center">
      <h2 className="text-[24px] font-bold text-[#333]">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.8] text-[#666]">
        {description}
      </p>
    </div>
  );
}