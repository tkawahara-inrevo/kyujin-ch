import { NextRequest, NextResponse } from "next/server";
import { Agent } from "undici";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
const WP_BASE = "https://wp.kyujin-ch.jp/wp-json/wp/v2";

type WpPost = {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
};

type WpMedia = { source_url: string };

function stripGutenberg(html: string): string {
  return html.replace(/<!--\s*\/?wp:[^>]*-->/g, "").replace(/\n\s*\n+/g, "\n").trim();
}

async function fetchAllWpPosts(): Promise<WpPost[]> {
  const all: WpPost[] = [];
  let page = 1;
  while (page <= 20) {
    const res = await fetch(`${WP_BASE}/biz-column?per_page=100&page=${page}&status=publish`, {
      // @ts-expect-error - undici dispatcher option
      dispatcher,
      cache: "no-store",
    });
    if (!res.ok) break;
    const batch = (await res.json()) as WpPost[];
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all;
}

async function fetchMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null;
  try {
    const res = await fetch(`${WP_BASE}/media/${mediaId}`, {
      // @ts-expect-error - undici dispatcher option
      dispatcher,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const m = (await res.json()) as WpMedia;
    return m.source_url ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const auth = req.headers.get("authorization");
  const queryToken = req.nextUrl.searchParams.get("token");
  const ok = auth === `Bearer ${secret}` || queryToken === secret;
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let posts: WpPost[];
  try {
    posts = await fetchAllWpPosts();
  } catch (e) {
    console.error("WP fetch failed", e);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }

  let created = 0;
  let updated = 0;

  for (const p of posts) {
    if (p.status !== "publish") continue;
    const body = stripGutenberg(p.content.rendered);
    const title = p.title.rendered;
    const thumbnailUrl = await fetchMediaUrl(p.featured_media);
    const publishedAt = new Date(`${p.date_gmt}Z`);

    const existing = await prisma.bizColumnPost.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.bizColumnPost.update({
        where: { id: existing.id },
        data: { title, body, thumbnailUrl: thumbnailUrl ?? undefined, isPublished: true, publishedAt },
      });
      updated++;
    } else {
      await prisma.bizColumnPost.create({
        data: { slug: p.slug, title, body, thumbnailUrl, isPublished: true, publishedAt },
      });
      created++;
    }
  }

  return NextResponse.json({ ok: true, created, updated, total: posts.length });
}
