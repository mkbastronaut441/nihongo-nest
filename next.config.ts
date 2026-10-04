import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["lucide-react"] },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
