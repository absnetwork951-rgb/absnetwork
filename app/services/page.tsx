import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesGrid from '@/components/services/ServicesGrid';
import WhyChooseServices from '@/components/services/WhyChooseServices';
import HowWeWork from '@/components/services/HowWeWork';
import ServicesCTA from '@/components/services/ServicesCTA';
import { getSiteSettings } from '@/lib/db';
import { getPublishedServices } from '@/lib/services';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'IT, Networking & Digital Services | ABS Network',
  description:
    'ABS Network provides networking, internet infrastructure, Cisco and MikroTik configuration, server administration, IT support, cybersecurity, Wi-Fi, structured cabling, CCTV, and digital technology services.',
  keywords: [
    'ABS Network Services',
    'IT Services Islamabad',
    'Networking Solutions Pakistan',
    'Cisco Configuration',
    'MikroTik RouterOS',
    'Windows Server Administration',
    'Active Directory',
    'Linux Server SysAdmin',
    'Structured Cabling Cat6',
    'Enterprise Wi-Fi',
    'Network Security Cybersecurity',
    'IP CCTV Surveillance',
    'Managed IT Support',
    'Web Development and Digital Solutions',
  ],
  alternates: {
    canonical: absoluteUrl('/services'),
  },
  openGraph: {
    title: 'IT, Networking & Digital Services | ABS Network',
    description:
      'ABS Network provides networking, internet infrastructure, Cisco and MikroTik configuration, server administration, IT support, cybersecurity, Wi-Fi, structured cabling, CCTV, and digital technology services.',
    type: 'website',
    url: absoluteUrl('/services'),
    siteName: 'ABS Network',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IT, Networking & Digital Services | ABS Network',
    description:
      'End-to-end IT, networking, server administration, cybersecurity, and digital infrastructure services by ABS Network.',
  },
};

export default async function ServicesPage() {
  const settings = getSiteSettings();
  const services = getPublishedServices();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)]">
        {/* 1. Services Hero */}
        <ServicesHero />

        {/* 2. Interactive Category Filter & Services Grid */}
        <section className="py-12 md:py-16 bg-white">
          <ServicesGrid services={services} />
        </section>

        {/* 3. Why Businesses Choose ABS Network */}
        <WhyChooseServices />

        {/* 4. How We Work (Process Timeline) */}
        <HowWeWork />

        {/* 5. Final IT Infrastructure CTA */}
        <ServicesCTA phone={settings.phone} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}
