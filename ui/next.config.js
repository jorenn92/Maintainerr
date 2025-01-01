/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  basePath: '',
  async redirects() {
    return [
      {
        source: '/docs',
        destination: 'https://docs.maintainerr.info/Introduction',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
