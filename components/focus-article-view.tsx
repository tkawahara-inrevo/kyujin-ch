import Image from "next/image";
import Link from "next/link";

type Props = {
  slug?: string;
  companyName: string;
  title: string;
  summary?: string | null;
  body: string;
  thumbnailUrl?: string | null;
  tags: string[];
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
  authorBio?: string | null;
  authorImageUrl?: string | null;
  /** プレビューモード（共有ボタン等を無効化、リンクを # に） */
  preview?: boolean;
};

function fmt(d: Date) {
  return new Date(d).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function sameDay(a: Date, b: Date) {
  const aa = new Date(a);
  const bb = new Date(b);
  return (
    aa.getFullYear() === bb.getFullYear() &&
    aa.getMonth() === bb.getMonth() &&
    aa.getDate() === bb.getDate()
  );
}

export function FocusArticleView({
  slug = "",
  companyName,
  title,
  summary,
  body,
  thumbnailUrl,
  tags,
  publishedAt,
  updatedAt,
  authorName,
  authorBio,
  authorImageUrl,
  preview = false,
}: Props) {
  const publishedStr = publishedAt ? fmt(publishedAt) : "";
  const showUpdated =
    publishedAt && updatedAt && !sameDay(publishedAt, updatedAt);

  const tagHref = (tag: string) => (preview ? "#" : `/focus?tag=${encodeURIComponent(tag)}`);

  return (
    <article className="flex-1 min-w-0">
      <p className="text-[16px] font-bold text-[#333]">
        {publishedStr || "（公開前）"}
        {showUpdated && (
          <span className="ml-3 text-[13px] font-normal text-[#666]">(更新: {fmt(updatedAt!)})</span>
        )}
      </p>
      <p className="mt-1 text-[16px] font-bold text-[#333]">{companyName}</p>
      <h1 className="mt-3 text-[36px] font-bold leading-[1.3] text-[#333]">{title}</h1>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-[5px]">
          {tags.map((tag, i) => (
            <Link
              key={tag}
              href={tagHref(tag)}
              className={`flex h-[20px] items-center rounded-full px-[15px] text-[12px] font-semibold tracking-[-0.24px] ${
                i === 0 ? "bg-[#333] text-white" : "bg-[#e5e5e5] text-[#333]"
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="my-6 border-t border-[#eee]" />

      <div className="flex flex-col gap-5 md:flex-row">
        {thumbnailUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-[#e3e3e3] md:flex-1">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized
            />
          </div>
        )}
        {summary && (
          <div className="rounded-[10px] bg-[#f4f4f4] p-[10px] text-[14px] leading-relaxed text-[#333] md:flex-1">
            {summary}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="focus-article-body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>

      <div className="my-8 border-t border-[#eee]" />

      {authorName && (
        <div className="rounded-[15px] border border-[#ccc] bg-white/80 p-5">
          <p className="text-[14px] font-semibold text-[#333]">この記事の執筆者</p>
          <div className="mt-3 flex gap-4">
            <div className="flex-1 text-[14px] text-[#333]">
              <p className="font-bold text-[16px]">{authorName}</p>
              {authorBio && (
                <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-line">{authorBio}</p>
              )}
            </div>
            {authorImageUrl && (
              <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-[10px]">
                <Image
                  src={authorImageUrl}
                  alt={authorName}
                  fill
                  className="object-cover"
                  sizes="90px"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!preview && (
        <>
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://kyujin-ch.jp/focus/${slug}`)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-[26px] items-center rounded-[5px] bg-black px-2 text-[12px] font-bold text-white"
            >
              ポスト
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://kyujin-ch.jp/focus/${slug}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-[26px] items-center rounded-[5px] bg-[#0031cb] px-2 text-[12px] font-bold text-white"
            >
              シェア
            </a>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/focus"
              className="flex h-[60px] w-[310px] items-center justify-center rounded-full bg-[#1d63e3] text-[16px] font-bold text-white transition hover:opacity-90"
            >
              記事一覧に戻る
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
