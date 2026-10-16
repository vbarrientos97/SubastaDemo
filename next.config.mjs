/** @type {import('next').NextConfig} */
const nextConfig = {
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
