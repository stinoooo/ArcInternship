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
    ]
  },
}

module.exports = nextConfig
