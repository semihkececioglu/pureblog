import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import "./env";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default bundleAnalyzer(nextConfig);
