import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin/", "/company/", "/mypage/", "/messages/", "/applications/", "/favorites/", "/api/"],
      },
    ],
    sitemap: "https://kyujin-ch.jp/sitemap.xml",
  };
}
