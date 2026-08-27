import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Zap,
  ShieldCheck,
  Network,
  ArrowRight,
  Phone,
  Headphones,
  Activity,
} from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import HomePackagesSection from '@/components/public/HomePackagesSection';
import { getSiteSettings, getPackages, getShopProducts } from '@/lib/db';

export const revalidate = 60;

export default function HomePage() {
  const settings = getSiteSettings();
  const packages = getPackages(true);
  const shopProducts = getShopProducts(true);

  const featuredPackages = packages.slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-28">
        <HeroSection settings={settings} />

        <section className="py-10 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">OPTICAL BACKHAUL</div>
                <div className="text-3xl sm:text-4xl font-light font-mono text-slate-900 tracking-tight">
                  {settings.statsFiberCoverageKm}+ <span className="text-base text-blue-600 font-bold">KM</span>
                </div>
                <div className="text-xs text-slate-500">Dedicated ring backhaul</div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">ACTIVE SUBSCRIBERS</div>
                <div className="text-3xl sm:text-4xl font-light font-mono text-slate-900 tracking-tight">
                  {settings.statsActiveSubscribers.toLocaleString()}+ <span className="text-base text-emerald-600 font-bold">Units</span>
                </div>
                <div className="text-xs text-slate-500">Homes & enterprise hubs</div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">SLA GUARANTEE</div>
                <div className="text-3xl sm:text-4xl font-light font-mono text-slate-900 tracking-tight">
                  {settings.statsUptimeGuarantee}
                </div>
                <div className="text-xs text-slate-500">24/7 Redundant NOC</div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">SHOP PRODUCTS</div>
                <div className="text-3xl sm:text-4xl font-light font-mono text-slate-900 tracking-tight">
                  {settings.statsShopProductCount}+ <span className="text-base text-blue-600 font-bold">Items</span>
                </div>
                <div className="text-xs text-slate-500">Professional networking gear</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
            <div className="text-left max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 font-bold">
                <span className="w-1.5 h-1.5 bg-blue-600" />
                PRIMARY INFRASTRUCTURE LAYERS
              </div>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
                Engineered for Zero Downtime & <span className="font-black text-blue-600">Absolute Symmetrical Speed</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ABS Network unites pure optical GPON to the premises with dedicated BGP routing and local NOC peering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 hover:border-blue-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-xl">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">LAYER_01</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Direct 100% Optical Fiber</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike legacy copper or hybrid coax systems, ABS Network runs pure optical fiber cables straight into your living room or server rack for true symmetric speeds.
                </p>
                <ul className="text-xs text-slate-700 space-y-2.5 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span>Equal 1:1 Upload &amp; Download Bandwidth</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span>No Fair Usage Policy (FUP) throttling</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 hover:border-emerald-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">LAYER_02</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Ultra-Low Gaming Latency</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct peering with PKIX, Cloudflare, Google, Meta, Steam, and Discord servers provides sub-10ms response times for flawless competitive online gaming.
                </p>
                <ul className="text-xs text-slate-700 space-y-2.5 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <span>Grade-A Bufferbloat Elimination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <span>Dual-Stack IPv4 &amp; IPv6 Routing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <HomePackagesSection packages={featuredPackages} totalCount={packages.length} />
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-white border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 font-bold">
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  NETWORKING EQUIPMENT
                </div>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
                  Professional <span className="font-black text-blue-600">Networking Shop</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  {settings.shopBannerText}
                </p>
              </div>

              <Link
                href="/shop"
                className="px-6 py-3.5 font-bold text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-all rounded-xl shadow-xs"
              >
                <span>Visit Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {shopProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {shopProducts.slice(0, 4).map((prod) => (
                  <Link key={prod.id} href="/shop" className="group bg-white border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-blue-500 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{prod.category.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-mono text-blue-600 font-bold">{prod.brand}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{prod.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{prod.shortDescription}</p>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-lg font-black font-mono text-slate-900">PKR {(prod.salePricePkr || prod.pricePkr).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[24px] border-blue-500/10 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3 text-left">
                  <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 font-bold">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    CORPORATE &amp; ENTERPRISE DIA
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900">
                    Need Dedicated 1:1 Bandwidth for Your Organization?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Get custom optical ring pulls, multiple static IP pools, dual-homed BGP routing, and 24/7 dedicated account engineers backed by contractual SLA.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2 font-mono">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 99.99% UPTIME SLA
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Headphones className="w-3.5 h-3.5 text-blue-600" /> DEDICATED NOC LEAD
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> 4-HOUR MTTR ON-SITE
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <Link
                    href="/contact?type=sales&subject=Enterprise%20Dedicated%20Leased%20Line%20Proposal"
                    className="py-3.5 px-6 font-bold text-xs uppercase tracking-widest text-center text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 border border-blue-500 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Request Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-3.5 px-6 font-bold text-xs uppercase tracking-widest text-center text-slate-800 hover:text-blue-600 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-center gap-2 font-mono transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>NOC: {settings.phone}</span>
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
