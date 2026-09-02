'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Phone,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Clock,
} from 'lucide-react';
import { getWhatsAppLink, PREFILLED_MESSAGES, ABS_WHATSAPP_DISPLAY } from '@/lib/whatsapp';

interface ServicesCTAProps {
  phone?: string;
}

export default function ServicesCTA({ phone = '+92 322 4180930' }: ServicesCTAProps) {
  const whatsappUrl = getWhatsAppLink(PREFILLED_MESSAGES.generalConsultation);

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="page-container relative z-10">
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full border-[30px] border-blue-600/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                <span>Technical Consultation</span>
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Need Help With Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-300">IT Infrastructure?</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Tell us what you need. Our technical team can help you design, configure,
                deploy, troubleshoot, and maintain your IT and network infrastructure.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise SLA Guarantees</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Rapid On-Site Dispatch</span>
                </span>
                <span className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-400" />
                  <span>Direct WhatsApp Line: {ABS_WHATSAPP_DISPLAY}</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3.5 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-lg flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>

              <Link
                href="/contact?type=technical_support&subject=IT%20Infrastructure%20Inquiry"
                className="btn-secondary btn-lg flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-bold"
              >
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Talk to an Engineer</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
