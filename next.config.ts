import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enable calling `getCloudflareContext()` in `next dev`
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Ensure Prisma client packages are not bundled by Next.js but resolved at runtime.
  // This matches the official @opennextjs/cloudflare Prisma example.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
