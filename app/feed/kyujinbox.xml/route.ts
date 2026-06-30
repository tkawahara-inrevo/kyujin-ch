import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10分キャッシュ

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(d: Date): string {
  return d.toUTCString();
}

function formatSalary(min: number | null | undefined, max: number | null | undefined): string {
  const fmt = (n: number) => `${n.toLocaleString()}円`;
  if (!min && !max) return "";
  if (min && max) return `${fmt(min)}〜${fmt(max)}`;
  if (min) return `${fmt(min)}〜`;
  return `〜${fmt(max!)}`;
}

const TARGET_LABELS: Record<string, string> = {
  NEW_GRAD: "新卒",
  MID_CAREER: "中途",
  PART_TIME_INTERN: "アルバイト・インターン",
  TEMPORARY: "派遣",
};

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://kyujin-ch.jp";

  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      isDeleted: false,
      reviewStatus: "PUBLISHED",
    },
    include: { company: { select: { name: true, websiteUrl: true } } },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });

  const buildDate = rfc822(new Date());

  const items = jobs.map((job) => {
    const url = `${baseUrl}/jobs/${job.id}`;
    const company = job.company?.name ?? "";
    const target = TARGET_LABELS[job.targetType] ?? "";
    const salary = formatSalary(job.salaryMin, job.salaryMax);
    const location = job.location ?? "";

    // description (HTML可、CDATAで囲む)
    const descParts: string[] = [];
    if (company) descParts.push(`<p><strong>企業:</strong> ${escapeXml(company)}</p>`);
    if (target) descParts.push(`<p><strong>対象:</strong> ${escapeXml(target)}</p>`);
    if (job.employmentType) descParts.push(`<p><strong>雇用形態:</strong> ${escapeXml(job.employmentType)}</p>`);
    if (location) descParts.push(`<p><strong>勤務地:</strong> ${escapeXml(location)}</p>`);
    if (salary) descParts.push(`<p><strong>給与:</strong> ${escapeXml(salary)}</p>`);
    if (job.categoryTag) descParts.push(`<p><strong>カテゴリ:</strong> ${escapeXml(job.categoryTag)}</p>`);
    if (job.jobSubcategory) descParts.push(`<p><strong>職種:</strong> ${escapeXml(job.jobSubcategory)}</p>`);
    if (job.description) descParts.push(`<div>${job.description}</div>`);
    const descHtml = descParts.join("\n");

    return `    <item>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <title>${escapeXml(job.title)}</title>
      <link>${escapeXml(url)}</link>
      <description><![CDATA[${descHtml}]]></description>
      <pubDate>${rfc822(job.updatedAt)}</pubDate>
      <category>${escapeXml(job.categoryTag ?? "")}</category>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>求人ちゃんねる</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>求人ちゃんねるで掲載中の求人一覧（求人ボックス向けフィード）</description>
    <language>ja</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>600</ttl>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
