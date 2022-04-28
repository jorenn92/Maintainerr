/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['image.tmdb.org'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/docs/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ]
  },
}

module.exports = nextConfig
