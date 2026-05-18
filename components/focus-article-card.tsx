import Image from "next/image";
import Link from "next/link";

type Props = {
  slug: string;
  title: string;
  companyName: string;
  thumbnailUrl?: string | null;
  tags: string[];
  publishedAt?: Date | null;
  isHot?: boolean;
};

export function FocusArticleCard({
  slug,
  title,
  companyName,
  thumbnailUrl,
  tags,
  publishedAt,
  isHot,
}: Props) {
  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <Link
      href={`/focus/${slug}`}
      className="flex flex-col gap-[8px] rounded-[10px] bg-white p-[10px] transition hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="relative h-[159px] w-full overflow-hidden rounded-[10px] bg-[#e3e3e3]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 430px"
            unoptimized={!thumbnailUrl.includes("s3.ap-northeast-1.amazonaws.com")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[13px] text-[#999]">画像なし</span>
          </div>
        )}
        {/* バッジ */}
        {isHot && (
          <div className="absolute right-0 top-0">
            <div className="relative flex items-center justify-center px-[9px] py-[3px]">
              <div className="absolute inset-0 bg-white" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%, 20% 0)" }} />
              <span className="relative text-[12px] font-semibold text-[#1f2775]">PICK UP</span>
            </div>
          </div>
        )}
      </div>

      {/* タグ */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[5px]">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={`flex h-[20px] items-center rounded-full px-[15px] text-[12px] font-semibold tracking-[-0.24px] ${
                i === 0
                  ? "bg-[#333] text-white"
                  : "bg-[#e5e5e5] text-[#333]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* タイトル */}
      <p className="text-[20px] font-semibold leading-[1.2] text-[#333] tracking-[-0.4px]">
        {title}
      </p>

      {/* 会社名 */}
      <p className="text-[14px] text-[#333]">{companyName}</p>

      {/* 掲載日 */}
      {dateStr && (
        <p className="text-right text-[12px] text-[#767676]">掲載日 {dateStr}</p>
      )}
    </Link>
  );
}
