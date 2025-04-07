import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 시 ESLint 검사를 비활성화합니다 (프로덕션에서만 사용하세요)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
