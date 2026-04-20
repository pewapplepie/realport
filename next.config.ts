import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["127.0.0.1"],
  basePath: isGithubPages ? "/realport" : undefined,
  assetPrefix: isGithubPages ? "/realport/" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1529307474719-3d0a417aaf8a",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1511452885600-a3d2c9148a31",
      },
    ],
  },
};

export default nextConfig;
