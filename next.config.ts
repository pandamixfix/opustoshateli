/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Разрешаем кэшировать картинки из БД
      },
    ],
  },
};

export default nextConfig; // если у тебя файл .js, напиши module.exports = nextConfig;