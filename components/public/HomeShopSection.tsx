'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';
import ShopProductCard from './ShopProductCard';
import ShopDetailModal from './ShopDetailModal';
import ShopInquiryModal from './ShopInquiryModal';

interface HomeShopSectionProps {
  products: ShopProduct[];
}

export default function HomeShopSection({ products }: HomeShopSectionProps) {
  const featured = products.slice(0, 3);
  const [activeDetailProduct, setActiveDetailProduct] = useState<ShopProduct | null>(null);
  const [activeInquiryProduct, setActiveInquiryProduct] = useState<ShopProduct | null>(null);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="page-container space-y-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Shop Products
            </span>
            <h2 className="h2-section">
              Networking Equipment on <span className="text-blue-600">ABS Shop</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Professional fiber optic, routing, and switching equipment for homes, offices, and backbone infrastructure.
            </p>
          </div>

          <Link href="/shop" className="btn-primary btn-sm shrink-0">
            <ShoppingBag className="w-4 h-4" />
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Shop catalog is being stocked</h3>
            <p className="text-sm text-slate-500">
              Our networking equipment range is being added. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((prod) => (
              <ShopProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(p) => setActiveDetailProduct(p)}
                onInquire={(p) => setActiveInquiryProduct(p)}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/shop" className="btn-primary">
            <ShoppingBag className="w-4 h-4" />
            Browse Full Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <ShopDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        onInquire={(p) => { setActiveDetailProduct(null); setActiveInquiryProduct(p); }}
      />
      <ShopInquiryModal
        product={activeInquiryProduct}
        onClose={() => setActiveInquiryProduct(null)}
      />
    </section>
  );
}
