import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  ShieldCheck,
  ArrowRight,
  Phone,
  Headphones,
  Activity,
} from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import HomePackagesSection from '@/components/public/HomePackagesSection';
import WhyChooseSection from '@/components/public/WhyChooseSection';
import VisualCategoryCards from '@/components/public/VisualCategoryCards';
import HomeShopSection from '@/components/public/HomeShopSection';
import NetworkImageMosaic from '@/components/home/NetworkImageMosaic';
import { getSupabaseSettings, getSupabasePackages } from '@/lib/supabase-cms';
import { getPublicShopProducts } from '@/lib/supabase-shop';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, packages, shopProducts] = await Promise.all([
    getSupabaseSettings(),
    getSupabasePackages(true),
    getPublicShopProducts(),
  ]);

  const featuredPackages = packages.slice(0, 3);

  const stats = [
    { label: 'Fiber Network', value: `${settings.statsFiberCoverageKm}`, unit: 'KM' },
    { label: 'Subscribers', value: settings.statsActiveSubscribers.toLocaleString(), unit: '+' },
    { label: 'Network Uptime', value: settings.statsUptimeGuarantee, unit: '' },
    { label: 'Support', value: '24/7', unit: '' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)]">
        <HeroSection settings={settings} />

        <section className="bg-slate-50 border-y border-slate-200">
          <div className="page-container py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-xs">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-6 sm:p-8 space-y-1.5">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                    {stat.unit && <span className="text-base text-blue-600 font-bold">{stat.unit}</span>}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="page-container space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="eyebrow">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Pure Optical Fiber
              </span>
              <h2 className="h2-section">
                Engineered for zero downtime and absolute <span className="text-blue-600">symmetrical speed</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ABS Network unites pure optical GPON to the premises with dedicated BGP routing and local NOC peering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 hover:border-blue-400 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-xl">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="h3-card">Direct 100% Optical Fiber</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pure optical fiber straight to your living room or server rack, delivering true symmetric speeds with zero throttling.
                </p>
                <ul className="text-sm text-slate-700 space-y-2.5 pt-1">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span>Equal 1:1 upload &amp; download bandwidth</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span>No fair usage policy (FUP) throttling</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 hover:border-emerald-400 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="h3-card">Low-Latency Gaming &amp; Enterprise Peering</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Direct peering with major exchange points and platforms provides dependable response times for competitive gaming and business traffic.
                </p>
                <ul className="text-sm text-slate-700 space-y-2.5 pt-1">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <span>Bufferbloat elimination on game routes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <span>Dual-stack IPv4 &amp; IPv6 routing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <VisualCategoryCards />

        <WhyChooseSection />

        <HomeShopSection products={shopProducts} />

        <NetworkImageMosaic />

        <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="page-container">
            <HomePackagesSection packages={featuredPackages} totalCount={packages.length} />
          </div>
        </section>

        <section className="py-16 md:py-24 bg-slate-50">
          <div className="page-container">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[24px] border-blue-500/10 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="eyebrow">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Business &amp; Enterprise
                  </span>
                  <h2 className="h2-section">
                    Need dedicated 1:1 bandwidth for your organization?
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Get custom optical ring pulls, multiple static IP pools, dual-homed BGP routing, and dedicated account engineers backed by a contractual SLA.
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-700 pt-1">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> 99.99% uptime SLA
                    </span>
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Headphones className="w-4 h-4 text-blue-600" /> Dedicated NOC lead
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <Link
                    href="/contact?type=sales&subject=Enterprise%20Dedicated%20Leased%20Line%20Proposal"
                    className="btn-primary"
                  >
                    <span>Request Proposal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn-secondary"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{settings.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}