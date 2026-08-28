'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { submitContactForm } from '@/lib/actions/public-forms';

interface ContactFormProps {
  defaultPackage?: string;
  defaultSubject?: string;
  defaultType?: string;
}

export default function ContactForm({
  defaultPackage,
  defaultSubject,
  defaultType,
}: ContactFormProps) {
  const searchParams = useSearchParams();
  const initialPackage = defaultPackage || searchParams.get('package') || '';
  const initialSubject = defaultSubject || searchParams.get('subject') || '';
  const initialType = defaultType || searchParams.get('type') || 'general';

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inquiryType, setInquiryType] = useState(initialType);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await submitContactForm(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Thank you! Your message has been sent.');
        (e.target as HTMLFormElement).reset();
      } else {
        setErrorMsg(res.error || 'Failed to submit contact form.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full mb-3">
            <Zap className="w-3.5 h-3.5" /> Fast Response Ticket
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Send Inquiry to ABS Network
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Our NOC technicians and sales specialists typically respond within 15 minutes during operating hours.
          </p>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Message Dispatched!</h4>
            <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
              {successMsg}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="btn-secondary"
              >
                Send Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* SEC-006 honeypot: invisible to users, filled by bots */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
            />
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-fullName" className="text-xs font-semibold text-slate-700">
                  Your Full Name *
                </label>
                <input
                  id="contact-fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Asad Ullah"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-700">
                  Phone / WhatsApp Number *
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="e.g. +92 321 5566778"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. asad@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Inquiry Type */}
              <div className="space-y-1.5">
                <label htmlFor="contact-inquiryType" className="text-xs font-semibold text-slate-700">
                  Inquiry Department *
                </label>
                <select
                  id="contact-inquiryType"
                  name="inquiryType"
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="new_connection">New Fiber Connection Application</option>
                  <option value="sales">Corporate & Business Leased Line</option>
                  <option value="package_inquiry">Broadband Package Upgrade / Query</option>
                  <option value="technical_support">24/7 NOC Technical Support</option>
                  <option value="billing">Billing & Payment Inquiries</option>
                  <option value="general">General Corporate Inquiry</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-700">
                  Subject *
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  defaultValue={initialSubject}
                  placeholder="e.g. Fiber coverage request in Sector G-11/2"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Package or Product interest */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="contact-packageInterest" className="text-xs font-semibold text-slate-700">
                  Interested Package / Product (Optional)
                </label>
                <input
                  id="contact-packageInterest"
                  name="packageInterest"
                  type="text"
                  defaultValue={initialPackage}
                  placeholder="e.g. ABS Ultra Gamer (75 Mbps) or ABS Managed Switch 24-Port"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700">
                  Message / Address Details *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Please describe your requirement, exact installation street address, or technical issue..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-none"
                />
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
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
