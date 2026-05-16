import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pycon-assets.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
