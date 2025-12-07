import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yaivqmritulnxvsdicgh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
