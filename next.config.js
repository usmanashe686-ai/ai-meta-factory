/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: false,       // disable SWC
  experimental: {
    forceSwcTransforms: false,
  },
  webpack: (config) => {
    // replace SWC loader with Babel loader
    config.module.rules.forEach(rule => {
      if (rule.use && rule.use.loader && rule.use.loader.includes('next-swc-loader')) {
        rule.use.loader = 'babel-loader';
        rule.use.options = {
          presets: ['next/babel'],
        };
      }
    });
    return config;
  },
};

module.exports = nextConfig;
