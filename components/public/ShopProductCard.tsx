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

export default function ShopProductCard({
  product,
  onInquire,
  onViewDetails,
  onToggleCompare,
  isCompared = false,
}: ShopProductCardProps) {
  const currentPrice = product.salePricePkr || product.pricePkr;
  const hasDiscount = product.salePricePkr && product.salePricePkr < product.pricePkr;

  const stockBadge = {
    in_stock: { label: 'In Stock', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    low_stock: { label: 'Low Stock', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    out_of_stock: { label: 'Out of Stock', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
    on_order: { label: 'On Order', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    pre_order: { label: 'Pre-Order', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  }[product.stockStatus] ?? { label: 'Available', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

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
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stockBadge.classes}`}>
              {stockBadge.label}
            </span>
            {product.isFeatured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{product.model}</span>
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              {product.warrantyYears}Y Warranty
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {Object.entries(product.specifications || {})
              .slice(0, 2)
              .map(([key, val]) => (
                <div
                  key={key}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                >
                  <span className="text-slate-400">{key}: </span>
                  <span className="font-semibold text-slate-800">{String(val)}</span>
                </div>
              ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-slate-500">PKR</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentPrice.toLocaleString()}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  PKR {product.pricePkr.toLocaleString()}
                </span>
              )}
            </div>

            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(product)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  isCompared
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300'
                }`}
                aria-pressed={isCompared}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-slate-100">
        <button
          onClick={() => onViewDetails(product)}
          className="py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Details</span>
        </button>

        <button
          onClick={() => onInquire(product)}
          className="py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Inquire</span>
        </button>
      </div>
    </div>
  );
}