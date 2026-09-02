import 'server-only';
import type { ServiceItem } from './db/types';
import {
  getServices,
  getFeaturedServices,
  getServiceBySlug,
} from './db';

/**
 * Public-facing service read facade.
 *
 * Only PUBLISHED services are ever exposed here. Drafts/unpublished services
 * never reach the homepage, services listing, detail pages, sitemap, or LLM
 * documentation.
 */

/** All published services ordered by display order. */
export function getPublishedServices(): ServiceItem[] {
  return getServices(true);
}

/** Published services that are marked as featured, ordered by display order. */
export function getHomepageServices(): ServiceItem[] {
  return getFeaturedServices();
}

/** Fetch a single published service by its slug (also resolves legacy slugs). */
export function getPublishedServiceBySlug(
  slug: string
): ServiceItem | undefined {
  return getServiceBySlug(slug, true);
}

/**
 * Related published services in the same category (up to `limit`),
 * excluding the current service. Falls back to any published services
 * when fewer than one related service is found in-category.
 */
export function getRelatedServices(
  service: ServiceItem,
  limit = 3
): ServiceItem[] {
  const all = getPublishedServices();
  const sameCategory = all.filter(
    (s) =>
      s.id !== service.id &&
      (s.category === service.category ||
        (s.capabilities || []).some((c) =>
          (service.capabilities || []).includes(c)
        ) ||
        (service.capabilities || []).some((c) =>
          (s.capabilities || []).includes(c)
        ))
  );
  if (sameCategory.length > 0) {
    return sameCategory.slice(0, limit);
  }
  return all.filter((s) => s.id !== service.id).slice(0, limit);
}
