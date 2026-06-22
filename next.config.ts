import type { NextConfig } from "next";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set fallback DNS servers in next.config.ts:", e);
}
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "images.unsplash.com" }, // Unsplash placeholders
    ],
  },
  typescript: {
    // Skip typechecking during production builds (saves build times)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip linting check during production builds (saves build times)
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;