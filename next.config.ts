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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'guvgbfgtdrsvobkndbzl.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;