/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack explicitly (Monaco works better with webpack)
  experimental: {
    turbo: false,
  },
};

module.exports = nextConfig;
