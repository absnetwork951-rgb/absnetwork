'use client';

import React from 'react';
import Image from 'next/image';
import { X, Shield, ShoppingCart, Network } from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';

interface ShopCompareModalProps {
  products: ShopProduct[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onInquire: (product: ShopProduct) => void;
}

export default function ShopCompareModal({
  products,
  onClose,
  onRemove,
  onInquire,
}: ShopCompareModalProps) {
  if (products.length === 0) return null;

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specifications || {})))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product Technical Comparison</h2>
            <p className="text-xs text-slate-500 font-mono">
              Comparing {products.length} {products.length === 1 ? 'product' : 'products'} side-by-side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4 font-mono">
                  Feature / Spec
                </th>
                {products.map((prod) => (
                  <th key={prod.id} className="p-4 w-1/3 align-top">
                    <div className="relative space-y-2">
                      <button
                        onClick={() => onRemove(prod.id)}
                        className="absolute -top-1 -right-1 p-1 bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative w-full h-28 overflow-hidden bg-slate-50 border border-slate-200">
                        {prod.images && prod.images[0] ? (
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                            sizes="180px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Network className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-2">{prod.name}</div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        PKR {(prod.salePricePkr || prod.pricePkr).toLocaleString()}
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onInquire(prod);
                        }}
                        className="w-full py-2 px-3 text-xs font-bold uppercase tracking-wider font-mono text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-1 transition-colors shadow-sm"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Order</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="p-4 font-semibold text-slate-500">Category</td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 capitalize text-slate-800">
                    {prod.category.replace(/_/g, ' ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Brand / Model</td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 text-slate-800">
                    {prod.brand} ({prod.model})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">SKU</td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 text-slate-800 font-mono">
                    {prod.sku || '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500">Warranty</td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 text-emerald-700 font-semibold font-mono">
                    {prod.warrantyYears} Years Manufacturer Warranty
                  </td>
                ))}
              </tr>

              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className="p-4 font-semibold text-slate-500">{key}</td>
                  {products.map((prod) => (
                    <td key={prod.id} className="p-4 text-slate-800 font-mono">
                      {prod.specifications?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
