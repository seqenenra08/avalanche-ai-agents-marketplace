import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      electron: false,
      // React Native específicos
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      '@react-native-community/netinfo': false,
      'react-native-background-timer': false,
    };
    
    // Ignorar advertencias de módulos que no se pueden resolver
    config.ignoreWarnings = [
      /Module not found: Can't resolve '@react-native-async-storage\/async-storage'/,
      /Module not found: Can't resolve 'react-native'/,
    ];
    
    return config;
  },
};

export default nextConfig;
