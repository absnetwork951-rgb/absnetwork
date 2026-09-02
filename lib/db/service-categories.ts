import { ServiceCategoryConfig } from './types';

/**
 * Single source of truth for the Services catalog categories.
 *
 * Admins assign a service to one of these categories. Because new categories
 * can be added here without code changes elsewhere, admins never need a
 * developer to introduce a new category.
 */
export const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  { slug: 'networking', label: 'Networking', iconName: 'Network' },
  { slug: 'internet', label: 'Internet Infrastructure', iconName: 'Globe' },
  { slug: 'cisco', label: 'Cisco', iconName: 'Cpu' },
  { slug: 'mikrotik', label: 'MikroTik', iconName: 'Router' },
  { slug: 'servers', label: 'Servers', iconName: 'Server' },
  { slug: 'it-support', label: 'IT Support', iconName: 'Wrench' },
  { slug: 'cybersecurity', label: 'Cybersecurity', iconName: 'ShieldCheck' },
  { slug: 'wireless', label: 'Wireless', iconName: 'Wifi' },
  { slug: 'cabling', label: 'Cabling', iconName: 'Cable' },
  { slug: 'cctv', label: 'CCTV', iconName: 'Video' },
  { slug: 'digital-services', label: 'Digital Services', iconName: 'Code' },
];

/** Legacy category slugs used by the old CMS shape (kept for migration). */
export const LEGACY_SERVICE_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'broadband', label: 'Broadband' },
  { slug: 'enterprise', label: 'Enterprise' },
  { slug: 'cloud', label: 'Cloud' },
  { slug: 'support', label: 'Support' },
];

export function getServiceCategory(
  slug: string | undefined
): ServiceCategoryConfig | undefined {
  if (!slug) return undefined;
  return (
    SERVICE_CATEGORIES.find((c) => c.slug === slug) ||
    LEGACY_SERVICE_CATEGORIES.find((c) => c.slug === slug)
  );
}

export function getServiceCategoryLabel(slug: string | undefined): string {
  return getServiceCategory(slug)?.label ?? slug ?? 'General';
}

/** All category slugs that admins may assign (new-style categories). */
export function getAssignableCategorySlugs(): string[] {
  return SERVICE_CATEGORIES.map((c) => c.slug);
}
