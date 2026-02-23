import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: isGitHubPagesBuild ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGitHubPagesBuild ? "/Campus_Hub" : "",
  assetPrefix: isGitHubPagesBuild ? "/Campus_Hub/" : undefined,
};

export default nextConfig;
