import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, listEvents, listHosts } from "@/services/content";
import { listPartners } from "@/services/content/partners";
import { listSpotlights } from "@/services/content/spotlights";
import { site } from "@/lib/site";

/** Rebuilt hourly so new articles appear without a deploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, hosts, events, partners, spotlights] = await Promise.all([
    getAllPublishedSlugs(),
    listHosts(),
    listEvents("all"),
    listPartners(),
    listSpotlights(),
  ]);

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/radio", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/programm", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/charts", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/gespielt", priority: 0.5, changeFrequency: "hourly" as const },
    { path: "/news", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/moderatoren", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/events", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/partner", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/spotlight", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/highlights", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/radioaid", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/ueber-uns", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/mitmachen", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/presse", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/wunsch", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/so-gehts", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/overlay", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/partner-werden", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/neu", priority: 0.4, changeFrequency: "weekly" as const },
    { path: "/kontakt", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/impressum", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/datenschutz", priority: 0.2, changeFrequency: "yearly" as const },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...articles.map((article) => ({
      url: `${site.url}/news/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...hosts.map((host) => ({
      url: `${site.url}/moderatoren/${host.slug}`,
      lastModified: new Date(host.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...events.map((event) => ({
      url: `${site.url}/events/${event.slug}`,
      lastModified: new Date(event.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...partners.map((partner) => ({
      url: `${site.url}/partner/${partner.slug}`,
      lastModified: new Date(partner.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...spotlights.map((spotlight) => ({
      url: `${site.url}/spotlight/${spotlight.slug}`,
      lastModified: new Date(spotlight.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
