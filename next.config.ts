/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/supabase/:path*',
        destination: 'https://guvgbfgtdrsvobkndbzl.supabase.co/:path*',
      },
    ];
  },
};

module.exports = nextConfig;