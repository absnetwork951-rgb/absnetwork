import 'server-only';
import type { Metadata } from 'next';
import type { ServiceItem } from './db/types';
import { getWhatsAppLink } from './whatsapp';

/**
 * Site URL resolution.
 *
 * Production domain is https://www.absnetwork.com.pk. The NEXT_PUBLIC_SITE_URL
 * env var (or APP_URL, used by the hosting provider) lets the deployment
 * override it per-environment. Localhost/internal URLs are never hardcoded.
 */
export const PRODUCTION_SITE_URL = 'https://www.absnetwork.com.pk';

export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;
  if (env && env.trim() && !env.includes('localhost') && !env.includes('127.0.0.1')) {
    return env.replace(/\/+$/, '');
  }
  return PRODUCTION_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === '/') return `${base}/`;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export function serviceUrl(slug: string): string {
  return absoluteUrl(`/services/${slug}`);
}

export function serviceRelativeUrl(slug: string): string {
  return `/services/${slug}`;
}

export { slugify } from './slug';

/** Generates a permanent redirect URL response for a canonical service slug. */
export function permanentRedirectUrl(slug: string): string {
  return serviceRelativeUrl(slug);
}

export const BRANDED_SOCIAL_IMAGE = '/images/abs-network-og.jpg';

/** Builds richest possible OG/social image URL for a service. */
export function serviceSocialImage(service: ServiceItem): string {
  return service.socialImage || service.imageUrl || BRANDED_SOCIAL_IMAGE;
}

/**
 * Automatic SEO fallbacks so a service with empty SEO fields still ships
 * valid, complete metadata.
 */
export function resolveServiceMetadata(
  service: ServiceItem,
  settings: { companyName?: string; shortName?: string; tagline?: string; phone?: string; whatsapp?: string }
): {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogImage: string;
  whatsappLink: string;
} {
  const brand = settings.shortName || 'ABS Network';
  const title = service.seoTitle || `${service.title} | ${brand}`;
  const description =
    service.seoDescription || service.shortDescription || settings.tagline || '';
  const keywords =
    (service.seoKeywords?.length ? service.seoKeywords : [service.title, brand]) as string[];
  const canonical = service.canonicalUrl || serviceUrl(service.slug);
  const robotsIndex = service.robotsIndex !== false;
  const robotsFollow = service.robotsFollow !== false;
  const ogImage = absoluteUrl(serviceSocialImage(service));
  const whatsappLink = getWhatsAppLink(
    service.whatsappMessage ||
      `Hello ABS Network, I am interested in your ${service.title} services. I would like to discuss my requirements.`,
    '923224180930'
  );
  return { title, description, keywords, canonical, robotsIndex, robotsFollow, ogImage, whatsappLink };
}

/** Metadata object for a service detail page (title/desc/canonical/OG/twitter/robots). */
export function buildServiceMetadata(service: ServiceItem, settings: any): Metadata {
  const seo = resolveServiceMetadata(service, settings);
  const robots = seo.robotsIndex && seo.robotsFollow
    ? { index: true, follow: true }
    : {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
      };
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: 'website',
      siteName: settings.shortName || 'ABS Network',
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: service.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    robots,
  };
}

/** Schema.org organization structured data (meant to match visible content). */
export function organizationJsonLd(settings: any) {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.shortName || 'ABS Network',
    legalName: settings.companyName || 'ABS Network Broadband SMC-Pvt-Ltd',
    url,
    telephone: settings.phone || '',
    email: settings.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address || '',
      addressLocality: settings.city || '',
      addressCountry: 'PK',
    },
    sameAs: [
      settings.facebookUrl,
      settings.instagramUrl,
      settings.linkedinUrl,
      settings.twitterUrl,
    ].filter(Boolean),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: settings.phone || '',
        contactType: 'customer service',
      },
    ],
  };
}

/** Schema.org Website + WebSite search metadata block. */
export function websiteJsonLd(settings: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.shortName || 'ABS Network',
    url: absoluteUrl('/'),
    description: settings.tagline || '',
  };
}

/** Schema.org Service structured data for a service detail page. */
export function serviceJsonLd(service: ServiceItem, settings: any) {
  const seo = resolveServiceMetadata(service, settings);
  const categoryLabel = 'Networking';
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: seo.description,
    url: seo.canonical,
    image: seo.ogImage,
    serviceType: service.category || categoryLabel,
    category: service.category || categoryLabel,
    provider: {
      '@type': 'Organization',
      name: settings.shortName || 'ABS Network',
      url: absoluteUrl('/'),
    },
    areaServed: { '@type': 'Country', name: 'PK' },
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceUrl: seo.whatsappLink,
        servicePhone: settings.phone || '',
      },
    ],
  };
}

/** Schema.org BreadcrumbList for a service detail page. */
export function breadcrumbJsonLd(service: ServiceItem) {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Services', item: absoluteUrl('/services') },
    { '@type': 'ListItem', position: 3, name: service.title, item: serviceUrl(service.slug) },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function webPageJsonLd(title: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: absoluteUrl(path),
  };
}
