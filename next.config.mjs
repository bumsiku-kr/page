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
};

export default removeImports()(nextConfig); 