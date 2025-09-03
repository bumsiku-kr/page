import removeImports from 'next-remove-imports';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  },
  reactStrictMode: true,
  swcMinify: true,
  // Remove all console.* calls from production builds (client & server)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
};

export default removeImports()(nextConfig); 
