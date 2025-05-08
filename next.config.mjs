/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 타입 에러가 있어도 빌드가 진행되도록 설정
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 