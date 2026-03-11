import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

const apiPrefixes = ["auth", "users", "permissions", "trigger-history", "jenkins"];

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return apiPrefixes.map((prefix) => ({
      source: `/api/${prefix}/:path*`,
      destination: `${backendUrl}/api/${prefix}/:path*`,
    }));
  },
};

export default nextConfig;
