import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { currentSeason } from "@/lib/utils/season";

/**
 * Les pages fixes, plus les dix dernières saisons. On ne liste pas les 77
 * saisons ni les manches : ça gonflerait le sitemap de milliers d'URL dont la
 * plupart n'intéressent personne, et chacune coûte un appel à f1api.dev à la
 * première visite.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: SITE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${SITE_URL}/weekend`, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/calendar`, changeFrequency: "weekly", priority: 0.8 },
      {
        url: `${SITE_URL}/standings`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      { url: `${SITE_URL}/drivers`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${SITE_URL}/results`, changeFrequency: "weekly", priority: 0.7 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified: now }));

  const current = Number(currentSeason());
  const seasons: MetadataRoute.Sitemap = Array.from(
    { length: 10 },
    (_, i) => current - i,
  ).map((year) => ({
    url: `${SITE_URL}/results/${year}`,
    lastModified: now,
    changeFrequency: year === current ? "weekly" : "yearly",
    priority: year === current ? 0.7 : 0.4,
  }));

  return [...staticRoutes, ...seasons];
}
