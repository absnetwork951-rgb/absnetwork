import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  Home,
  Layers,
  MessageSquare,
  Phone,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Clock,
} from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ServiceCard from '@/components/services/ServiceCard';
import {
  getSiteSettings,
  getServiceBySlug,
  getServiceCanonicalSlug,
} from '@/lib/db';
import {
  getPublishedServices,
  getRelatedServices,
} from '@/lib/services';
import {
  buildServiceMetadata,
  serviceJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
  serviceRelativeUrl,
} from '@/lib/seo';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { getServiceCategoryLabel } from '@/lib/db/service-categories';
import { svcIcon } from '@/components/services/service-icons';

export const revalidate = 60;

export function generateStaticParams() {
  const services = getPublishedServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = getServiceCanonicalSlug(slug);
  const raw = getServiceBySlug(slug, true);
  if (!raw && canonicalSlug) {
    // Legacy slug: redirect to canonical handled in page body. Metadata still
    // resolves against the canonical service.
    const canonical = getServiceBySlug(canonicalSlug, true);
    if (canonical) return buildServiceMetadata(canonical, getSiteSettings());
  }
  if (!raw) return {};
  return buildServiceMetadata(raw, getSiteSettings());
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = getSiteSettings();

  // Resolve legacy/redirect slugs -> canonical before rendering.
  const canonicalSlug = getServiceCanonicalSlug(slug);
  let service = getServiceBySlug(slug, true);

  if (!service && canonicalSlug) {
    service = getServiceBySlug(canonicalSlug, true);
  }

  if (!service) {
    notFound();
  }

  // If the requested slug is not the current canonical slug, issue a
  // permanent 301 redirect to the canonical URL.
  if (service.slug !== slug) {
    permanentRedirect(serviceRelativeUrl(service.slug));
  }

  const related = getRelatedServices(service);
  const Icon = svcIcon(service.iconName);
  const whatsappUrl = getWhatsAppLink(
    service.whatsappMessage ||
      `Hello ABS Network, I am interested in your ${service.title} services.`,
    '923224180930'
  );
  const categoryLabel = getServiceCategoryLabel(service.category);
  const capabilities = service.capabilities?.length
    ? service.capabilities
    : service.features || [];

  const orgLd = organizationJsonLd(settings);
  const siteLd = websiteJsonLd(settings);
  const serviceLd = serviceJsonLd(service, settings);
  const crumbLd = breadcrumbJsonLd(service);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="bg-slate-50 border-b border-slate-200">
          <div className="page-container py-3">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600">
                  <Home className="w-3 h-3" /> Home
                </Link>
              </li>
              <li className="text-slate-300"><ChevronRight className="w-3 h-3" /></li>
              <li><Link href="/services" className="hover:text-blue-600">Services</Link></li>
              <li className="text-slate-300"><ChevronRight className="w-3 h-3" /></li>
              <li className="text-slate-400">{categoryLabel}</li>
              <li className="text-slate-300"><ChevronRight className="w-3 h-3" /></li>
              <li aria-current="page" className="font-semibold text-slate-800 line-clamp-1">{service.title}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0">
            {service.imageUrl && (
              <Image
                src={service.imageUrl}
                alt={service.imageAlt || `${service.title} - ABS Network`}
                fill
                sizes="100vw"
                priority
                className="object-cover object-center opacity-40"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950" />
          </div>
          <div className="relative z-10 page-container py-16 md:py-24 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="badge bg-white/95 text-slate-800">{categoryLabel}</span>
              {service.badge && <span className="badge bg-blue-600/90 text-white">{service.badge}</span>}
              {service.isFeatured && <span className="badge bg-amber-400/90 text-slate-900">Featured</span>}
            </div>
            <div className="max-w-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Icon className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {service.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{service.ctaLabel || 'Chat on WhatsApp'}</span>
                </a>
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="btn-secondary inline-flex items-center justify-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Phone className="w-4 h-4" />
                  <span>{settings.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-16 md:py-20 bg-white">
          <div className="page-container grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-5" id="service-description">
                <div className="space-y-2">
                  <span className="eyebrow">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Overview
                  </span>
                  <h2 className="h2-section">About This Service</h2>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {service.fullDescription}
                </div>
              </div>

              {capabilities.length > 0 && (
                <div className="space-y-5" id="service-capabilities">
                  <div className="space-y-2">
                    <span className="eyebrow">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      Capabilities
                    </span>
                    <h2 className="h2-section">What We Deliver</h2>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 leading-snug">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-5" id="service-cta">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-[20px] border-white/10 pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Ready to get started with {service.title}?
                    </h2>
                    <p className="text-sm text-blue-100 max-w-xl">
                      Speak with a certified ABS Network engineer today. We&apos;ll assess your
                      environment and propose a tailored solution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {service.ctaLabel || 'Chat on WhatsApp'}
                      </a>
                      <Link href={`/contact?subject=${encodeURIComponent(`Enquiry: ${service.title}`)}`} className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold border border-white/40 text-white rounded-xl hover:bg-white/10 transition-colors">
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Service image card */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                <div className="relative h-52 w-full bg-slate-900">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.imageAlt || `${service.title} - ABS Network`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
                      <Icon className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{categoryLabel}</div>
                      <div className="text-[11px] text-slate-400">Service Category</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick contact */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Prefer to talk?</h3>
                <div className="space-y-2.5">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs text-slate-700 hover:text-blue-600">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0"><MessageSquare className="w-4 h-4" /></span>
                    WhatsApp
                  </a>
                  <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 text-xs text-slate-700 hover:text-blue-600">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0"><Phone className="w-4 h-4" /></span>
                    {settings.phone}
                  </a>
                  <Link href="/contact" className="flex items-center gap-3 text-xs text-slate-700 hover:text-blue-600">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0"><Home className="w-4 h-4" /></span>
                    Contact Page
                  </Link>
                </div>
                <div className="pt-3 border-t border-slate-200 space-y-2.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Licensed ISP & infrastructure provider</div>
                  <div className="flex items-center gap-2"><Headphones className="w-3.5 h-3.5 text-blue-600" /> 24/7 NOC support</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /> {settings.businessHours}</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related services */}
        {related.length > 0 && (
          <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
            <div className="page-container space-y-8">
              <div className="space-y-2">
                <span className="eyebrow">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Related Services
                </span>
                <h2 className="h2-section">Explore More Solutions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <ServiceCard key={r.id} service={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />

      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
    </div>
  );
}
