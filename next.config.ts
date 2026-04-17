import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/realport" : undefined,
  assetPrefix: isGithubPages ? "/realport/" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1486406146926-c627a92ad1ab",
        search: "?auto=format&fit=crop&w=1800&q=80",
      },
    ],
  },
};

export default nextConfig;
