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
  // Заставляем сервера Vercel забрать файлы себе и не дергать Supabase!
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