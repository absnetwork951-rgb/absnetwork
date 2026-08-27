'use client';

import React, { useState } from 'react';
import {
  Search,
  X,
  Network,
  ArrowUpDown,
} from 'lucide-react';
import { ShopProduct, SiteSettings } from '@/lib/db/types';
import ShopProductCard from './ShopProductCard';
import ShopDetailModal from './ShopDetailModal';
import ShopCompareModal from './ShopCompareModal';
import ShopInquiryModal from './ShopInquiryModal';

interface ShopClientProps {
  initialProducts: ShopProduct[];
  settings: SiteSettings;
}

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'fiber_optics', label: 'Fiber Optics' },
  { id: 'network_cables', label: 'Network Cables' },
  { id: 'routers', label: 'Routers' },
  { id: 'network_switches', label: 'Switches' },
  { id: 'optical_devices', label: 'Optical Devices' },
  { id: 'fiber_accessories', label: 'Fiber Accessories' },
  { id: 'network_accessories', label: 'Network Accessories' },
  { id: 'tools_testing', label: 'Tools & Testing' },
  { id: 'rack_cabinet', label: 'Rack & Cabinet' },
];

export default function ShopClient({
  initialProducts,
  settings,
}: ShopClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [stockOnly, setStockOnly] = useState(false);

  const [activeDetailProduct, setActiveDetailProduct] = useState<ShopProduct | null>(null);
  const [activeInquiryProduct, setActiveInquiryProduct] = useState<ShopProduct | null>(null);
  const [compareList, setCompareList] = useState<ShopProduct[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const brands = ['all', ...Array.from(new Set(initialProducts.map((p) => p.brand)))];

  const filteredProducts = initialProducts
    .filter((prod) => {
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && prod.brand !== selectedBrand) return false;
      if (stockOnly && prod.stockStatus !== 'in_stock') return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = prod.name.toLowerCase().includes(q) ||
          prod.brand.toLowerCase().includes(q) ||
          prod.model.toLowerCase().includes(q) ||
          prod.shortDescription.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const priceA = a.salePricePkr || a.pricePkr;
      const priceB = b.salePricePkr || b.pricePkr;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return a.displayOrder - b.displayOrder;
    });

  const handleToggleCompare = (product: ShopProduct) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) return;
      setCompareList([...compareList, product]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setCompareList(compareList.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-16">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fiber optic cables, routers, switches, patch panels..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 capitalize"
            >
              <option value="all">All Brands ({brands.length - 1})</option>
              {brands.filter((b) => b !== 'all').map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded-md border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>In-Stock Items Only</span>
          </label>
        </div>
      </div>

      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-white border-2 border-blue-600 text-slate-900 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              {compareList.length}
            </span>
            <span className="text-xs font-bold">Selected for Spec Comparison</span>
          </div>
          <button onClick={() => setShowCompareModal(true)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl">
            Compare Specs Side-by-Side
          </button>
          <button onClick={() => setCompareList([])} className="p-1 text-slate-400 hover:text-slate-700" title="Clear comparison list">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
          <Network className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No networking equipment found</h3>
          <p className="text-xs text-slate-500">Try modifying your search keywords or switching category filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedBrand('all'); setStockOnly(false); }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ShopProductCard
              key={prod.id}
              product={prod}
              onViewDetails={(p) => setActiveDetailProduct(p)}
              onInquire={(p) => setActiveInquiryProduct(p)}
              onToggleCompare={handleToggleCompare}
              isCompared={compareList.some((c) => c.id === prod.id)}
            />
          ))}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase font-bold text-blue-600 tracking-wider bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
            Why Shop with ABS Network
          </span>
          <h3 className="text-2xl sm:text-3xl font-light text-slate-900">
            Quality Networking <span className="font-black text-blue-600">Equipment &amp; Expert Support</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Professional-grade fiber optic, routing, and switching equipment sourced from certified distributors with full manufacturer warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Certified Hardware', desc: 'All products sourced from authorized distributors with full manufacturer warranty and documentation.' },
            { num: '02', title: 'Technical Consulting', desc: 'Our network engineers help you select the right equipment for your infrastructure requirements.' },
            { num: '03', title: 'Nationwide Delivery', desc: 'Fast delivery across Pakistan with optional on-site installation and configuration support.' },
          ].map((item) => (
            <div key={item.num} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2 text-center shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 font-mono font-bold text-sm flex items-center justify-center mx-auto rounded-xl">
                {item.num}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <ShopDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        onInquire={(p) => { setActiveDetailProduct(null); setActiveInquiryProduct(p); }}
      />
      <ShopCompareModal
        products={compareList}
        onClose={() => setShowCompareModal(false)}
        onRemove={handleRemoveCompare}
        onInquire={(p) => { setShowCompareModal(false); setActiveInquiryProduct(p); }}
      />
      <ShopInquiryModal
        product={activeInquiryProduct}
        onClose={() => setActiveInquiryProduct(null)}
      />
    </div>
  );
}
