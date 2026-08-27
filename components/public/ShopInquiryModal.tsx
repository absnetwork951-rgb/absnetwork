'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';
import { submitShopInquiry } from '@/lib/actions/public-forms';

interface ShopInquiryModalProps {
  product: ShopProduct | null;
  onClose: () => void;
}

export default function ShopInquiryModal({ product, onClose }: ShopInquiryModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ message: string; orderNumber: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) return null;

  const unitPrice = product.salePricePkr || product.pricePkr;
  const estimatedTotal = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('productId', product.id);
    formData.set('productName', product.name);
    formData.set('quantity', String(quantity));
    formData.set('estimatedTotalPkr', String(estimatedTotal));

    try {
      const res = await submitShopInquiry(formData);
      if (res.success && res.orderNumber) {
        setSuccessResult({
          message: res.message,
          orderNumber: res.orderNumber,
        });
      } else {
        setErrorMessage(res.error || 'Failed to submit inquiry');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Order Inquiry</h2>
              <p className="text-xs text-slate-500 font-mono">ABS Network Shop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {successResult ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto rounded-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Order Inquiry Received!</h3>
              <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                {successResult.message}
              </p>
              <div className="p-4 bg-white border border-slate-200 inline-block text-xs font-mono text-slate-900">
                Order Tracking #: <strong className="text-blue-600">{successResult.orderNumber}</strong>
              </div>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="py-3 px-6 text-xs font-bold font-mono uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                >
                  Close &amp; Return to Shop
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SEC-006 honeypot: invisible to users, filled by bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
              />
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-200 font-mono">
                      {product.brand}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{product.name}</h4>
                    <div className="text-xs text-slate-500 font-mono">Model: {product.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-mono">Unit Price</div>
                    <div className="text-base font-black text-slate-900 font-mono">
                      PKR {unitPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label htmlFor="modal-qty" className="text-xs text-slate-700 font-medium">Quantity:</label>
                    <div className="flex items-center border border-slate-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-slate-700 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <input
                        id="modal-qty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center bg-transparent text-xs font-bold font-mono text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 text-slate-700 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Estimated Total</div>
                    <div className="text-lg font-black text-blue-600 font-mono">
                      PKR {estimatedTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="shop-cust-name" className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <input id="shop-cust-name" name="customerName" type="text" required placeholder="e.g. Ahmed Raza" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="shop-phone" className="text-xs font-semibold text-slate-700">Phone / WhatsApp *</label>
                  <input id="shop-phone" name="phone" type="tel" required placeholder="e.g. +92 300 1234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="shop-email" className="text-xs font-semibold text-slate-700">Email Address *</label>
                  <input id="shop-email" name="email" type="email" required placeholder="e.g. you@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="shop-city" className="text-xs font-semibold text-slate-700">City / Region *</label>
                  <input id="shop-city" name="city" type="text" required placeholder="e.g. Islamabad" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="shop-address" className="text-xs font-semibold text-slate-700">Delivery Address *</label>
                  <input id="shop-address" name="address" type="text" required placeholder="House/Plot, Street, Sector" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="shop-notes" className="text-xs font-semibold text-slate-700">Special Requirements / Notes</label>
                  <textarea id="shop-notes" name="notes" rows={2} placeholder="e.g. Bulk order for 20 units, need fiber patch panel spec..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 font-mono font-bold text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Confirm Order Inquiry</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
                  No online payment charged now. Our team will contact you to finalize details.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
