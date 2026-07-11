import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server Actions default to a 1MB body limit, which phone-camera photos
      // (news cover images, club logos) routinely exceed.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
