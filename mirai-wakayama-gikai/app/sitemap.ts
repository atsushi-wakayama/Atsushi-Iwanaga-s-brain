import type { MetadataRoute } from "next";
import { members } from "@/data/mock";

const SITE_URL = "https://mirai-wakayama-ken-gikai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/members`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const memberRoutes: MetadataRoute.Sitemap = members.map((m) => ({
    url: `${SITE_URL}/members/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...memberRoutes];
}
