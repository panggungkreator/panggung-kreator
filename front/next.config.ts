import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  env: {
    USERNAME_ADMIN: process.env.USERNAME_ADMIN || process.env.NEXT_PUBLIC_USERNAME_ADMIN || "adminpangkreas",
    NEXT_PUBLIC_USERNAME_ADMIN: process.env.NEXT_PUBLIC_USERNAME_ADMIN || process.env.USERNAME_ADMIN || "adminpangkreas",
  },
  async redirects() {
    return [
      {
        source: '/checkout',
        destination: '/registration',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

