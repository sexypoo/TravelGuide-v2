import type { NextConfig } from 'next';
import { validateServerEnvironment } from './src/lib/env/server';

const environment = validateServerEnvironment(process.env);

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${environment.apiInternalUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
