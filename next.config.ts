import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
