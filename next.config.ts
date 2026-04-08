import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kyujin-ch-documents.s3.ap-northeast-1.amazonaws.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "kyujin-ch.jp",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wp.kyujin-ch.jp",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
