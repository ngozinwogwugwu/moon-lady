/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA headers — Next.js serves manifest.json from /public automatically
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
      },
    ]
  },
}

export default nextConfig
