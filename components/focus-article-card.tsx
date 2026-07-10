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

/** 公開日から 7 日以内なら新着扱い */
function isNewArticle(publishedAt?: Date | null): boolean {
  if (!publishedAt) return false;
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return now - published <= sevenDaysMs && now >= published;
}

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
  const isNew = isNewArticle(publishedAt);

  return (
    <Link
      href={`/focus/${slug}`}
      className="flex h-full flex-col gap-[8px] rounded-[10px] bg-white p-[10px] transition hover:shadow-md"
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
        {/* NEW バッジ (左上) */}
        {isNew && (
          <div className="absolute left-0 top-0">
            <div className="relative flex items-center justify-center px-[9px] py-[3px]">
              <div className="absolute inset-0 bg-[#eb0937]" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)" }} />
              <span className="relative text-[12px] font-semibold text-white">NEW</span>
            </div>
          </div>
        )}
        {/* PICK UP バッジ (右上) */}
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

      {/* タイトル: 残り領域を吸収して下部要素を揃える */}
      <p className="flex-1 text-[20px] font-semibold leading-[1.2] text-[#333] tracking-[-0.4px]">
        {title}
      </p>

      {/* 会社名 (下部に固定) */}
      <p className="text-[14px] text-[#333]">{companyName}</p>

      {/* 掲載日 (下部に固定) */}
      <p className="text-right text-[12px] text-[#767676]">
        {dateStr ? `掲載日 ${dateStr}` : " "}
      </p>
    </Link>
  );
}
