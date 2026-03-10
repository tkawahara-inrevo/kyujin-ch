type DocumentUploadCardProps = {
  title: string;
  uploaded?: boolean;
  fileName?: string;
};

export function DocumentUploadCard({
  title,
  uploaded = false,
  fileName,
}: DocumentUploadCardProps) {
  return (
    <div className="rounded-[18px] border border-[#d9d9d9] bg-white p-5">
      <p className="text-[16px] font-bold text-[#333]">{title}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[22px] font-bold text-[#555]">
            {uploaded ? "アップロード済" : "未アップロード"}
          </p>
        </div>

        {uploaded && fileName && (
          <div className="rounded-[8px] bg-[#9a9a9a] px-3 py-2 text-[14px] font-bold text-white">
            {fileName}　×
          </div>
        )}
      </div>

      <button className="mt-5 w-full rounded-[10px] bg-[#2f6cff] px-5 py-4 text-[15px] font-bold text-white transition hover:opacity-90">
        {uploaded ? "ファイルを選択して差し替える" : "ファイルを選択してアップロードする"}
      </button>
    </div>
  );
}