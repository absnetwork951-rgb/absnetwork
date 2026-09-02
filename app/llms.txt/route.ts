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
  lines.push('> ' + settings.tagline);
  lines.push('');
  lines.push(`${settings.companyName} is a licensed fiber broadband and technology infrastructure provider in Islamabad, Pakistan. This page serves as a concise reference for AI assistants, search engines, and large language models.`);
  lines.push('');
  lines.push('## Company');
  lines.push(`- [About ${settings.companyName}](${siteUrl}/) : ${settings.tagline}`);
  lines.push(`- [Contact](${siteUrl}/contact) : Reach ${settings.companyName} by phone (${settings.phone}) or WhatsApp.`);
  lines.push(`- [Broadband Packages](${siteUrl}/packages) : Residential, business, gaming, and enterprise fiber internet plans.`);
  lines.push('');
  lines.push('## Services');
  lines.push('');
  services.forEach((service) => {
    lines.push(
      `- [${service.title}](${siteUrl}/services/${service.slug}) : ${service.shortDescription}`
    );
  });
  lines.push('');
  lines.push('## Shop');
  lines.push(`- [Fiber & Networking Equipment](${siteUrl}/shop) : Routers, fiber optics, network cables, switches, and related gear.`);
  lines.push('');
  lines.push(`This is a summary. For full details including capabilities and technical documentation, see ${siteUrl}/llms-full.txt.`);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
