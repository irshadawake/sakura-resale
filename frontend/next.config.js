/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 's3.ap-northeast-1.amazonaws.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
