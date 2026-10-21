/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/alertas',
        destination: '/notificaciones',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
