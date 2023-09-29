/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: { typedRoutes: true },
  reactStrictMode: true,
  transpilePackages: ["ui"],
};

module.exports = nextConfig;
