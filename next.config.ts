import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import "./env";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion/react", "@tiptap/react"],
  },
};

export default bundleAnalyzer(nextConfig);
