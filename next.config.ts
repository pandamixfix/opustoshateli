/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return[
      {
        // Перехватываем все запросы, идущие на /supabase/...
        source: '/supabase/:path*',
        // И незаметно перенаправляем их на реальный URL твоего проекта Supabase
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;