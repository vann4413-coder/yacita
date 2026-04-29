/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@yacita/types', '@yacita/utils'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {},
};

module.exports = nextConfig;
