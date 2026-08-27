import React from 'react';
import Image from 'next/image';
import { Network, Shield, ShoppingCart, Eye, Scale } from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';

interface ShopProductCardProps {
  product: ShopProduct;
  onInquire: (product: ShopProduct) => void;
  onViewDetails: (product: ShopProduct) => void;
  onToggleCompare?: (product: ShopProduct) => void;
  isCompared?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  network_cables: 'Network Cables',
  fiber_optics: 'Fiber Optics',
  fiber_accessories: 'Fiber Accessories',
  routers: 'Routers',
  network_switches: 'Network Switches',
  optical_devices: 'Optical Devices',
  network_accessories: 'Network Accessories',
  tools_testing: 'Tools & Testing',
  rack_cabinet: 'Rack & Cabinet',
  other: 'Other',
};

export default function ShopProductCard({
  product,
  onInquire,
  onViewDetails,
  onToggleCompare,
  isCompared = false,
}: ShopProductCardProps) {
  const currentPrice = product.salePricePkr || product.pricePkr;

  const stockBadge = {
    in_stock: { label: 'In Stock', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    low_stock: { label: 'Low Stock', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    out_of_stock: { label: 'Out of Stock', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    on_order: { label: 'On Order', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    pre_order: { label: 'Pre-Order', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  }[product.stockStatus] ?? { label: 'Available', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md">
      <div>
        <div className="relative w-full h-52 bg-slate-100 overflow-hidden border-b border-slate-200">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Network className="w-12 h-12" />
            </div>
          )}

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${stockBadge.color}`}>
              {stockBadge.label}
            </span>
            {product.isFeatured && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                FEATURED
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-300 shadow-sm">
              {product.brand}
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-300 shadow-sm">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{product.model}</span>
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              {product.warrantyYears}Y Warranty
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
            {product.shortDescription}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {Object.entries(product.specifications || {})
              .slice(0, 2)
              .map(([key, val]) => (
                <div
                  key={key}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                >
                  <span className="text-slate-400">{key}: </span>
                  <span className="font-semibold text-slate-800">{String(val)}</span>
                </div>
              ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">PRICE</div>
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="text-xs font-bold text-slate-500">PKR</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentPrice.toLocaleString()}
                </span>
              </div>
              {product.salePricePkr && (
                <span className="text-xs text-slate-400 line-through font-sans">
                  PKR {product.pricePkr.toLocaleString()}
                </span>
              )}
            </div>

            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(product)}
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                  isCompared
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <Scale className="w-3 h-3" />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-slate-100 mt-3 pt-3">
        <button
          onClick={() => onViewDetails(product)}
          className="py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Details</span>
        </button>

        <button
          onClick={() => onInquire(product)}
          className="py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Inquire / Order</span>
        </button>
      </div>
    </div>
  );
}
