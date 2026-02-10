import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/otp/:path*",
        destination: "https://scaleup.frameforge.one/scaleup2026/otp/:path*",
      },
    ];
  },
};

export default nextConfig;
