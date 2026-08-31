'use client';

import React, { useState } from 'react';
import {
  Search,
  X,
  Network,
  ChevronDown,
  ShieldCheck,
  ClipboardCheck,
  Truck,
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
  { id: 'other', label: 'Other' },
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

  const brands = Array.from(
    new Set(
      initialProducts
        .map((p) => p.brand)
        .filter((b): b is string => typeof b === 'string' && b.trim() !== '')
    )
  ).sort((a, b) => a.localeCompare(b));

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

  const isFiltering =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    stockOnly;

  const activeFilterCount =
    Number(searchTerm.trim() !== '') +
    Number(selectedCategory !== 'all') +
    Number(selectedBrand !== 'all') +
    Number(stockOnly);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setStockOnly(false);
  };

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
    <div className="space-y-12">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fiber optic cables, routers, switches, patch panels..."
              aria-label="Search products"
              className="input-base pl-11"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3 relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              aria-label="Filter by brand"
              className="input-base capitalize appearance-none pr-10"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="md:col-span-3 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="input-base appearance-none pr-10"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
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
        <div className="fixed bottom-6 right-6 z-40 bg-white border border-slate-200 shadow-xl p-4 rounded-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              {compareList.length}
            </span>
            <span className="text-sm font-semibold text-slate-900">Selected for Comparison</span>
          </div>
          <button onClick={() => setShowCompareModal(true)} className="btn-primary btn-sm">
            Compare Specs
          </button>
          <button
            onClick={() => setCompareList([])}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
            aria-label="Clear comparison list"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {initialProducts.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs animate-in fade-in">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
            <Network className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Shop catalog is being stocked</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Our networking equipment range is being added. Please check back soon or contact us directly for availability.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs animate-in fade-in">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No products match your filters</h3>
          <p className="text-sm text-slate-500">Try different keywords, another category or brand, or clear some filters.</p>
          <div className="pt-2">
            <button onClick={resetFilters} className="btn-secondary btn-sm">
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" role="status" aria-live="polite">
              Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> of{' '}
              {initialProducts.length} products
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                </span>
              )}
            </p>
            {isFiltering && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            )}
          </div>
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
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="eyebrow">Why Shop with ABS Network</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Quality Equipment, <span className="text-blue-600">Expert Support</span>
          </h3>
          <p className="text-sm sm:text-base text-slate-600">
            Professional-grade fiber optic, routing, and switching equipment sourced from certified distributors with full manufacturer warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: 'Certified Hardware', desc: 'All products sourced from authorized distributors with full manufacturer warranty and documentation.' },
            { icon: ClipboardCheck, title: 'Technical Consulting', desc: 'Our network engineers help you select the right equipment for your infrastructure requirements.' },
            { icon: Truck, title: 'Nationwide Delivery', desc: 'Fast delivery across Pakistan with optional on-site installation and configuration support.' },
          ].map((item) => (
            <div key={item.title} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 text-center shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center mx-auto rounded-xl">
                <item.icon className="w-5 h-5" />
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