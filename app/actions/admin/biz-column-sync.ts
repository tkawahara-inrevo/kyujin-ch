"use server";

import { Agent } from "undici";
import { requireColumnEditor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// wp.kyujin-ch.jp の証明書がSAN不一致なので検証をスキップ
const dispatcher = new Agent({ connect: { rejectUnauthorized: false } });

const WP_BASE = "https://wp.kyujin-ch.jp/wp-json/wp/v2";

type WpPost = {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  modified_gmt: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
};

type WpMedia = {
  source_url: string;
};

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

export async function syncBizColumnsFromWp(): Promise<{ ok: true; created: number; updated: number } | { ok: false; error: string }> {
  try {
    await requireColumnEditor();
  } catch {
    return { ok: false, error: "権限がありません" };
  }

  let posts: WpPost[];
  try {
    posts = await fetchAllWpPosts();
  } catch (e) {
    console.error("WP fetch failed", e);
    return { ok: false, error: "WPからの取得に失敗しました" };
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
        data: {
          title,
          body,
          thumbnailUrl: thumbnailUrl ?? undefined,
          isPublished: true,
          publishedAt,
        },
      });
      updated++;
    } else {
      await prisma.bizColumnPost.create({
        data: {
          slug: p.slug,
          title,
          body,
          thumbnailUrl,
          isPublished: true,
          publishedAt,
        },
      });
      created++;
    }
  }

  revalidatePath("/biz-column");
  revalidatePath("/admin/biz-columns");

  return { ok: true, created, updated };
}
