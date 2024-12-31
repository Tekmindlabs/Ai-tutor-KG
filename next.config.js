/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };
    }
    // Add this to handle OIDC token hash
    config.resolve.alias = {
      ...config.resolve.alias,
      'oidc-token-hash': require.resolve('oidc-token-hash'),
    };
    return config;
  },
  experimental: {
    // Remove middleware flag as it's no longer experimental in Next 14
    // middleware: true,
  }
};

module.exports = nextConfig;