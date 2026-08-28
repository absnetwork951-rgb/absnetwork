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
import Modal from './Modal';

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
    <Modal
      isOpen={!!product}
      onClose={onClose}
      labelledBy="shop-inquiry-title"
      maxWidth="max-w-2xl"
    >
      <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 id="shop-inquiry-title" className="text-lg font-bold text-slate-900">Order Inquiry</h2>
            <p className="text-xs text-slate-500">ABS Network Shop</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          aria-label="Close order inquiry"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
        {successResult ? (
          <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Order Inquiry Received!</h3>
            <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
              {successResult.message}
            </p>
            <div className="p-4 bg-white border border-slate-200 rounded-xl inline-block text-sm text-slate-900">
              Order Tracking #:{' '}
              <strong className="text-blue-600">{successResult.orderNumber}</strong>
            </div>
            <div className="pt-2">
              <button onClick={onClose} className="btn-primary">
                Close &amp; Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
            />
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-blue-700 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                    {product.brand}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{product.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">Model: {product.model}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Unit Price</div>
                  <div className="text-base font-black text-slate-900">
                    PKR {unitPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="modal-qty" className="text-xs text-slate-700 font-medium">Quantity:</label>
                  <div className="flex items-center border border-slate-300 bg-white rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      id="modal-qty"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Estimated Total</div>
                  <div className="text-lg font-black text-blue-600">
                    PKR {estimatedTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="shop-cust-name" className="text-sm font-semibold text-slate-700">Full Name *</label>
                <input id="shop-cust-name" name="customerName" type="text" required placeholder="e.g. Ahmed Raza" className="input-base" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="shop-phone" className="text-sm font-semibold text-slate-700">Phone / WhatsApp *</label>
                <input id="shop-phone" name="phone" type="tel" required placeholder="e.g. +92 300 1234567" className="input-base" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="shop-email" className="text-sm font-semibold text-slate-700">Email Address *</label>
                <input id="shop-email" name="email" type="email" required placeholder="e.g. you@example.com" className="input-base" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="shop-city" className="text-sm font-semibold text-slate-700">City / Region *</label>
                <input id="shop-city" name="city" type="text" required placeholder="e.g. Islamabad" className="input-base" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="shop-address" className="text-sm font-semibold text-slate-700">Delivery Address *</label>
                <input id="shop-address" name="address" type="text" required placeholder="House/Plot, Street, Sector" className="input-base" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="shop-notes" className="text-sm font-semibold text-slate-700">Special Requirements / Notes</label>
                <textarea id="shop-notes" name="notes" rows={2} placeholder="e.g. Bulk order for 20 units, need fiber patch panel spec..." className="input-base resize-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Confirm Order Inquiry
                  </>
                )}
              </button>
              <p className="text-sm text-center text-slate-500 mt-3">
                No online payment charged now. Our team will contact you to finalize details.
              </p>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}