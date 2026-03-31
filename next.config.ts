import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kyujin-ch-documents.s3.ap-northeast-1.amazonaws.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
