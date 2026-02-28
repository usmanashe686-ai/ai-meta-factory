/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Required for static export in Next.js 14+
  images: {
    unoptimized: true, // If you use next/image
  },
}

module.exports = nextConfig
