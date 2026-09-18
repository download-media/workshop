import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/workshop",
  async headers() {
    return [
      {
        // Pages and API responses must never be cached by the edge in front of us.
        // Self-hosted Next marks prerendered pages s-maxage=1y; Vercel's proxy cache
        // honored that, ignored cookies, and served one signed-in user's HTML to
        // everyone for 49 minutes. Static assets keep their own immutable caching.
        source: "/((?!_next/static|_next/image|images/).*)",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
