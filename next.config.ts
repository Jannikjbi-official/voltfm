import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Every external image host VoltFM renders. Next.js refuses to optimise a
     * remote image whose host is not listed here, which is the point: it stops
     * the site being turned into an image proxy for arbitrary URLs.
     */
    remotePatterns: [
      // UploadThing — article covers, host portraits, event images.
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
      // Discord CDN — avatars pulled for host and user profiles.
      { protocol: "https", hostname: "cdn.discordapp.com" },
      // iTunes Search API — track artwork in the player.
      { protocol: "https", hostname: "*.mzstatic.com" },
      // laut.fm — station artwork.
      { protocol: "https", hostname: "assets.laut.fm" },
      // picsum.photos — seeded placeholder photography for demo content.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Type errors must fail the build; they are never silently ignored.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
