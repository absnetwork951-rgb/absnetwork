import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageHeader from '@/components/public/PageHeader';
import ShopClient from '@/components/public/ShopClient';
import { getSupabaseSettings } from '@/lib/supabase-cms';
import { getPublicShopProducts } from '@/lib/supabase-shop';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ABS Network Shop | Cables, Routers, Switches & Accessories',
  description: 'Shop professional-grade fiber optic cables, network switches, routers, patch panels, and networking tools at ABS Network Broadband SMC-Pvt-Ltd.',
  openGraph: {
    title: 'ABS Network Shop',
    description: 'Professional networking equipment with manufacturer warranty and expert technical support.',
  },
};

export default async function ShopPage() {
  const [settings, products] = await Promise.all([
    getSupabaseSettings(),
    getPublicShopProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)] pb-24">
        <div className="page-container space-y-12">
          <div className="pt-12 md:pt-16">
            <PageHeader
              eyebrow="Shop Equipment"
              title={
                <>
                  ABS Network <span className="text-blue-600">Shop</span>
                </>
              }
              description="Professional-grade fiber optic cables, networking switches, routers, and infrastructure equipment sourced from certified distributors."
            />
          </div>

          <ShopClient initialProducts={products} settings={settings} />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
