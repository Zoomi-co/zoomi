import type { NextConfig } from "next";

const cms = new URL(process.env.ZOOMI_CMS_URL ?? "https://my.zoomi.co").origin;

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["@zoomi/site"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }],
  },
  async rewrites() {
    // Older static pages still live in public/ and keep their extensionless URLs from GitHub Pages.
    return {
      beforeFiles: [
        { source: "/id/dan", destination: "/id/dan.html" },
        { source: "/team", destination: "/team.html" },
        { source: "/marketing", destination: "/marketing.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      // Only the Zoomi editor may frame the preview page; nothing may frame the rest of the site.
      { source: "/zoomi-preview", headers: [{ key: "Content-Security-Policy", value: `frame-ancestors ${cms}` }] },
      { source: "/((?!zoomi-preview).*)", headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }] },
    ];
  },
};

export default nextConfig;
