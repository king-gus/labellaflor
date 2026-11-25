import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents + Workers causa 500/hang com promessas entre requests (OpenNext#1464)
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
