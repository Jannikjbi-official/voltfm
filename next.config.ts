import type { NextConfig } from "next";

/**
 * Only the production deployment (voltfm.xyz) may be indexed. The dev site
 * (dev.voltfm.xyz) and every other preview build tell crawlers to stay away,
 * otherwise search engines would list unreleased work next to the real site.
 */
const isIndexable = process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

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

  async redirects() {
    return [
      /* Die Playlist lag kurz auf einer eigenen Seite und steht jetzt direkt
         auf /radio. Alte Links sollen dort ankommen. */
      { source: "/radio/playlist", destination: "/radio#playlist", permanent: true },
    ];
  },

  async headers() {
    if (isIndexable) return [];
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
