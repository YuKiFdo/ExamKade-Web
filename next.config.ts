import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Bypass NextConfig type checking for new option
  allowedDevOrigins: ['drivable-hazelnut-snowiness.ngrok-free.dev'],
};

export default nextConfig;
