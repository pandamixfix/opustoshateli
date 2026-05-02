/** @type {import('next').NextConfig} */
const nextConfig = {
  // ДОБАВЛЯЕМ ВОТ ЭТОТ БЛОК:
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Разрешаем прямые ссылки с Supabase
      },
      {
        protocol: 'https',
        hostname: 'opustoshateli.vercel.app', // Разрешаем твои абсолютные прокси-ссылки
      },
      {
        protocol: 'http',
        hostname: 'localhost', // На всякий случай для локальной разработки
      }
    ],
  },
  
  // Твои редиректы оставляем как есть:
  async rewrites() {
    return[
      {
        source: '/supabase/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;