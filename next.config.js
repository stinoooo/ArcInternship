/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  async redirects() {
    return [
      {
        source: '/gebruik',
        destination: '/use',
        permanent: true,
      },
      {
        source: '/favicon.png',
        destination: '/favicon.svg',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
