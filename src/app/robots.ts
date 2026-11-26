import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { isPreviewDeploy } from "@/lib/deploy";

export default function robots(): MetadataRoute.Robots {
  // dev.voltfm.xyz and other preview builds must not be crawled at all.
  if (isPreviewDeploy()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never index account or admin surfaces.
        disallow: ["/admin", "/admin/", "/konto", "/login", "/registrieren", "/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
