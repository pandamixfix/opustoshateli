/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gmasrqyfcupgqrxgnnmx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        // Перенаправляем запросы с клиента на твой новый Supabase
        source: '/supabase/:path*',
        destination: 'https://gmasrqyfcupgqrxgnnmx.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;