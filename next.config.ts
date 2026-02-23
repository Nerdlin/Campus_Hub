import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repositoryBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Campus_Hub";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: isGitHubPagesBuild ? "export" : undefined,
  trailingSlash: isGitHubPagesBuild,
  images: isGitHubPagesBuild
    ? {
        unoptimized: true,
      }
    : undefined,
  basePath: isGitHubPagesBuild ? repositoryBasePath : undefined,
  assetPrefix: isGitHubPagesBuild ? repositoryBasePath : undefined,
};

export default nextConfig;
