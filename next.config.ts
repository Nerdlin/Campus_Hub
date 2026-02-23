import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repositoryBasePath = "/Campus_Hub";

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
