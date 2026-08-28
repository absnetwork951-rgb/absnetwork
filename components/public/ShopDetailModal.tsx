'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Shield, Check, CheckCircle2, ShoppingCart, Network } from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';
import Modal from './Modal';

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

  if (!product) return null;

  const currentPrice = product.salePricePkr || product.pricePkr;
  const isDiscounted = product.salePricePkr && product.salePricePkr < product.pricePkr;

  return (
    <Modal isOpen={!!product} onClose={onClose} labelledBy="shop-detail-title" maxWidth="max-w-4xl">
      <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
            {product.brand} · {CATEGORY_LABELS[product.category] || product.category}
          </span>
          <span className="text-xs text-slate-500">Model: {product.model}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-50 border border-slate-200 rounded-xl">
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
                <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
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
                    className={`relative w-16 h-16 overflow-hidden border-2 rounded-lg transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600 scale-105'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
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
              <h2 id="shop-detail-title" className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-slate-500">PKR</span>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {currentPrice.toLocaleString()}
                  </span>
                  {isDiscounted && (
                    <span className="text-sm text-slate-400 line-through">
                      PKR {product.pricePkr.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-200">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Warranty
                  </span>
                  <span className="flex items-center gap-1 text-blue-700 font-medium">
                    <Shield className="w-4 h-4 text-blue-600" /> {product.warrantyYears} Years Guarantee
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Key Features</h3>
                <ul className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  onClose();
                  onInquire(product);
                }}
                className="btn-primary w-full"
              >
                <ShoppingCart className="w-4 h-4" />
                Request Quote / Order
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Full Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-sm gap-3"
                  >
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="font-semibold text-slate-900 text-right">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}