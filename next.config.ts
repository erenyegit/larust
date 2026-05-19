import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@mysten/walrus", "@mysten/walrus-wasm"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
