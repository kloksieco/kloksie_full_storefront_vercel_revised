/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vercel.app', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
