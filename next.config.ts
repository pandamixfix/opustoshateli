const nextConfig = {
  async rewrites() {
    return[
      {
        source: '/supabase/:path*',
        destination: 'https://guvgbfgtdrsvobkndbzl.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;