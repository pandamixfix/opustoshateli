/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Ловим все запросы, которые начинаются с /supabase
        source: '/supabase/:path*',
        // И перенаправляем их на реальный URL Supabase из .env
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;