import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
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

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-mono uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              High-Speed Fiber Plans
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-slate-900 tracking-tight">
              ABS Network <span className="font-black text-blue-600">Broadband Packages</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              True symmetric speeds, unlimited high-speed data, dual-band Wi-Fi optical router included, and 24/7 dedicated NOC support for your digital life.
            </p>
          </div>

          {/* Client Filter & Grid */}
          <PackagesClient initialPackages={packages} settings={settings} />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
