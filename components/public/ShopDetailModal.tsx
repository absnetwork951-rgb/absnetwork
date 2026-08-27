'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Shield, Check, CheckCircle2, ShoppingCart, Network } from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';

interface ShopDetailModalProps {
  product: ShopProduct | null;
  onClose: () => void;
  onInquire: (product: ShopProduct) => void;
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

export default function ShopDetailModal({
  product,
  onClose,
  onInquire,
}: ShopDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const currentPrice = product.salePricePkr || product.pricePkr;
  const isDiscounted = product.salePricePkr && product.salePricePkr < product.pricePkr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold font-mono px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200">
              {product.brand} &bull; {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <span className="text-xs font-mono text-slate-500">Model: {product.model}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-50 border border-slate-200">
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Network className="w-16 h-16" />
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-600 text-white font-mono shadow-sm">
                    Featured
                  </span>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-blue-600 scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`thumb ${idx}`}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 leading-tight">
                  <span className="font-bold">{product.name}</span>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>

                <div className="p-5 bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Product Pricing
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold font-mono text-slate-500">PKR</span>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
                      {currentPrice.toLocaleString()}
                    </span>
                    {isDiscounted && (
                      <span className="text-sm font-mono text-slate-400 line-through">
                        PKR {product.pricePkr.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Warranty
                    </span>
                    <span className="flex items-center gap-1 text-blue-700 font-medium">
                      <Shield className="w-4 h-4 text-blue-600" /> {product.warrantyYears} Years Guarantee
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Key Features
                  </div>
                  <ul className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onInquire(product);
                  }}
                  className="flex-1 py-3.5 px-6 font-mono font-bold text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Request Quote / Order</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Full Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.fullDescription}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="font-bold text-slate-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
