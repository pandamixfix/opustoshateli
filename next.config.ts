/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // МАГИЯ: Полностью отключаем глючный оптимизатор Vercel
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'guvgbfgtdrsvobkndbzl.supabase.co',
        pathname: '/**',
      },
    ],
  },
  
  // НАШ ПРОКСИ (Обход блокировок)
  async rewrites() {
    return[
      {
        source: '/supabase/:path*',
        destination: 'https://guvgbfgtdrsvobkndbzl.supabase.co/:path*',
      },
    ];
  },

  // МАГИЯ VERCEL: Бронебойное кэширование
  async headers() {
    return[
      {
        source: '/supabase/:path*',
        headers:[
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;