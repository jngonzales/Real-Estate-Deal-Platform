import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so Turbopack doesn't guess it from
    // lockfiles found in parent directories.
    root: path.join(__dirname),
  },
};

export default nextConfig;
