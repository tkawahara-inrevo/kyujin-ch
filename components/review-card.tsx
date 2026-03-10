type ReviewCardProps = {
  title?: string;
  body?: string;
  date?: string;
  editable?: boolean;
};

export function ReviewCard({
  title = "仕事内容が分かりやすい",
  body = "仕事内容が分かりやすい\n求人票の内容が具体的で、選考の流れも明確でした。次は面談まで進めたいです。",
  date = "2026/02/20",
  editable = false,
}: ReviewCardProps) {
  return (
    <div className="rounded-[12px] border border-[#d7d7d7] bg-white p-5">
      <p className="text-[14px] font-bold text-[#333]">★★★★★</p>
      <p className="mt-3 text-[28px] font-bold text-[#333]">{title}</p>
      <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.8] text-[#555]">
        {body}
      </p>
      <p className="mt-3 text-[13px] text-[#888]">投稿日 {date}</p>

      {editable && (
        <div className="mt-4">
          <button className="rounded-[8px] bg-[#9a9a9a] px-3 py-2 text-[13px] font-bold text-white">
            編集・削除　×
          </button>
        </div>
      )}
    </div>
  );
}