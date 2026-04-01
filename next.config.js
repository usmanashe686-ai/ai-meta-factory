/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // If you have environment variables, list them here:
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_FLASK_URL: process.env.NEXT_PUBLIC_FLASK_URL,
    NEXT_PUBLIC_BUILD_SERVICE_URL: process.env.NEXT_PUBLIC_BUILD_SERVICE_URL,
    NEXT_PUBLIC_REAL_TIME_URL: process.env.NEXT_PUBLIC_REAL_TIME_URL,
    NEXT_AUTH_URL: process.env.NEXT_AUTH_URL,
  },
};

module.exports = nextConfig;
