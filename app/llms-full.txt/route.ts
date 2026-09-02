import { getSiteSettings } from '@/lib/db';
import { getPublishedServices } from '@/lib/services';
import { getSiteUrl } from '@/lib/seo';
import { getServiceCategoryLabel } from '@/lib/db/service-categories';

export const revalidate = 3600;

export function GET() {
  const siteUrl = getSiteUrl();
  const settings = getSiteSettings();
  const services = getPublishedServices();

  const lines: string[] = [];
  lines.push(`# ${settings.companyName}`);
  lines.push('');
  lines.push(`> ${settings.tagline}`);
  lines.push('');
  lines.push(
    `${settings.companyName} (${settings.legalRegistration}) is a licensed fiber broadband and technology infrastructure provider based in ${settings.city}, Pakistan. This file is the full machine-readable reference for AI assistants.`
  );
  lines.push('');
  lines.push('## Company');
  lines.push('');
  lines.push(`- Name: ${settings.companyName}`);
  lines.push(`- Legal registration: ${settings.legalRegistration}`);
  lines.push(`- Tagline: ${settings.tagline}`);
  lines.push(`- Address: ${settings.address}`);
  lines.push(`- City: ${settings.city}`);
  lines.push(`- Phone: ${settings.phone}`);
  lines.push(`- WhatsApp: ${settings.whatsapp}`);
  lines.push(`- Email: ${settings.email}`);
  lines.push(`- Business hours: ${settings.businessHours}`);
  lines.push(`- Fiber network coverage: ${settings.statsFiberCoverageKm} km`);
  lines.push(`- Active subscribers: ${settings.statsActiveSubscribers}`);
  lines.push(`- Network uptime guarantee: ${settings.statsUptimeGuarantee}`);
  lines.push('');
  lines.push('## Broadband Packages');
  lines.push(`- Full package catalog: ${siteUrl}/packages`);
  lines.push('');
  lines.push('## Services');
  lines.push('');
  services.forEach((service) => {
    const category = getServiceCategoryLabel(service.category);
    lines.push(`### ${service.title}`);
    lines.push('');
    lines.push(`Category: ${category}`);
    lines.push('');
    lines.push(`Short description: ${service.shortDescription}`);
    lines.push('');
    // Type 1 by design
    lines.push(`Overview: ${service.fullDescription}`.replace(/\n/g, ' '));
    lines.push('');
    if (service.capabilities?.length) {
      lines.push('Capabilities:');
      service.capabilities.forEach((cap) => lines.push(`- ${cap}`));
      lines.push('');
    }
    if (service.badge) {
      lines.push(`Badge: ${service.badge}`);
      lines.push('');
    }
    lines.push(`URL: ${siteUrl}/services/${service.slug}`);
    lines.push('');
  });
  lines.push('## Shop');
  lines.push(`- Fiber and networking equipment: ${siteUrl}/shop`);
  lines.push('');
  lines.push('## Contact');
  lines.push(`- Contact page: ${siteUrl}/contact`);
  lines.push(`- WhatsApp: ${settings.whatsapp || settings.phone}`);
  lines.push(
    `- For sales: ${settings.salesEmail || settings.email}`
  );
  lines.push(
    `- For support: ${settings.supportEmail || settings.supportPhone}`
  );
  lines.push('');
  lines.push('Copyright © ' + new Date().getFullYear() + ' ' + settings.companyName + '. All rights reserved.');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
