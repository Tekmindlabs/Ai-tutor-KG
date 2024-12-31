/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add fallbacks for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };
    }

    // Add alias for oidc-token-hash
    config.resolve.alias = {
      ...config.resolve.alias,
      'oidc-token-hash': require.resolve('oidc-token-hash'),
    };

    return config;
  }
};

module.exports = nextConfig;