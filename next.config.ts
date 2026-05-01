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
};

export default nextConfig;