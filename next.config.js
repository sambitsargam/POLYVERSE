/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': require.resolve('crypto-browserify'),
        'stream': require.resolve('stream-browserify'),
        'url': require.resolve('url/'),
        'zlib': require.resolve('browserify-zlib'),
        'http': require.resolve('stream-http'),
        'https': require.resolve('https-browserify'),
        'assert': require.resolve('assert/'),
        'os': require.resolve('os-browserify/browser'),
        'path': require.resolve('path-browserify'),
      }
    }

    // Ignore React Native and Node.js specific modules
    config.externals.push({
      '@react-native-async-storage/async-storage': 'AsyncStorage',
      'pino-pretty': 'console',
    })

    // Handle buffer polyfill
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    )

    return config
  }
}

module.exports = nextConfig