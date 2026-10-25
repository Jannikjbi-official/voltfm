import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, listEvents, listHosts } from "@/services/content";
import { site } from "@/lib/site";

/** Rebuilt hourly so new articles appear without a deploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, hosts, events] = await Promise.all([
    getAllPublishedSlugs(),
    listHosts(),
    listEvents("all"),
  ]);

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/radio", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/radio/playlist", priority: 0.5, changeFrequency: "hourly" as const },
    { path: "/programm", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/news", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/moderatoren", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/events", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/radioaid", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/ueber-uns", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/mitmachen", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/presse", priority: 0.4, changeFrequency: "monthly" as const },
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
  ];
}
