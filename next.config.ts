/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'guvgbfgtdrsvobkndbzl.supabase.co',
        pathname: '/**',
      },
    ],
  },
  // МАГИЯ ПРОКСИРОВАНИЯ (Обход блокировок без VPN)
  async rewrites() {
    return[
      {
        source: '/supabase/:path*',
        destination: 'https://guvgbfgtdrsvobkndbzl.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;