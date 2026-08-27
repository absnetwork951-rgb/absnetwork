import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ShopClient from '@/components/public/ShopClient';
import { getSiteSettings, getShopProducts } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ABS Network Shop | Cables, Routers, Switches & Accessories',
  description: 'Shop professional-grade fiber optic cables, network switches, routers, patch panels, and networking tools at ABS Network Broadband SMCVP Pvt Ltd.',
  openGraph: {
    title: 'ABS Network Shop',
    description: 'Professional networking equipment with manufacturer warranty and expert technical support.',
  },
};

export default function ShopPage() {
  const settings = getSiteSettings();
  const products = getShopProducts(true);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-mono uppercase font-bold text-blue-800 tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Shop Equipment
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-slate-900 tracking-tight">
              ABS Network <span className="font-black text-blue-600">Shop</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Professional-grade fiber optic cables, networking switches, routers, and infrastructure equipment sourced from certified distributors.
            </p>
          </div>

          <ShopClient initialProducts={products} settings={settings} />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
