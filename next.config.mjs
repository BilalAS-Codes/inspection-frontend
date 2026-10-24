/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/files/:path*',
        destination: `${backendUrl}/files/:path*`
      }
    ];
  }
};

export default nextConfig;
