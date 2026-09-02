import type { MetadataRoute } from 'next';
import { getPublishedServices } from '@/lib/services';
import {
  getSiteUrl,
  serviceUrl,
} from '@/lib/seo';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const services = getPublishedServices();

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/packages`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => {
    const canonical = service.canonicalUrl || serviceUrl(service.slug);
    return {
      url: canonical,
      lastModified: service.updatedAt
        ? new Date(service.updatedAt)
        : service.publishedAt
          ? new Date(service.publishedAt)
          : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [...staticEntries, ...serviceEntries];
}
