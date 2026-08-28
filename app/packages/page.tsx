import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageHeader from '@/components/public/PageHeader';
import PackagesClient from '@/components/public/PackagesClient';
import { getSiteSettings, getPackages } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ABS Network Broadband Packages | Symmetrical Gigabit Fiber',
  description: 'Explore ultra-fast optical fiber broadband plans for home streaming, pro gaming, and business internet by ABS Network Broadband SMCVP Pvt Ltd.',
  openGraph: {
    title: 'ABS Network Broadband Packages | Symmetrical Gigabit Fiber',
    description: 'High-speed fiber broadband packages with included Wi-Fi router, unlimited data, and zero throttling by ABS Network.',
  },
};

export default function PackagesPage() {
  const settings = getSiteSettings();
  const packages = getPackages(true);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)] pb-24">
        <div className="page-container space-y-12">
          <div className="pt-12 md:pt-16">
            <PageHeader
              eyebrow="High-Speed Fiber Plans"
              title={
                <>
                  ABS Network <span className="text-blue-600">Broadband Packages</span>
                </>
              }
              description="True symmetric speeds, unlimited high-speed data, a dual-band Wi-Fi optical router included, and 24/7 dedicated NOC support. All plans are monthly with taxes applied at billing."
            />
          </div>

          <PackagesClient initialPackages={packages} settings={settings} />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
