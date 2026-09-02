'use client';

import React from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Network,
  Server,
  Cpu,
} from 'lucide-react';
import { getWhatsAppLink, PREFILLED_MESSAGES } from '@/lib/whatsapp';

export default function ServicesHero() {
  const whatsappConsultationUrl = getWhatsAppLink(PREFILLED_MESSAGES.generalConsultation);

  const targetSectors = [
    'Corporate Offices',
    'Schools & Universities',
    'Hospitals',
    'Banks & Fintech',
    'Shops & Retail',
    'Restaurants',
    'Factories & Warehouses',
    'Enterprises & ISPs',
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-slate-800">
      {/* Subtle background circuit / glowing grid effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="page-container relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Enterprise IT &amp; Networking Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
              Complete IT, Networking &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-300">
                Digital Infrastructure
              </span>{' '}
              Solutions
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              From network design and server administration to internet infrastructure,
              cybersecurity, and digital solutions — ABS Network helps businesses build,
              manage, and maintain reliable technology infrastructure.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href={whatsappConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                <MessageSquare className="w-5 h-5 text-blue-100" />
                <span>Get a Free Consultation</span>
              </a>

              <a
                href="#services-catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition-all hover:border-slate-600"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certified Engineers</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>On-Site &amp; Remote</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 NOC Monitoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-800/60 shadow-2xl shadow-blue-900/20 group">
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <Image
                    src="/hero3.jpg"
                    alt="ABS Network Enterprise IT and Networking Infrastructure"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                </div>

                <div className="p-5 sm:p-6 bg-slate-900/95 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        NOC Operations Active
                      </span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono">
                      Multi-Vendor SLA
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-center">
                      <Network className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Cisco / MikroTik</div>
                      <div className="text-[10px] text-slate-400">Routing &amp; VLAN</div>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-center">
                      <Server className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Win / Linux</div>
                      <div className="text-[10px] text-slate-400">SysAdmin &amp; AD</div>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-center">
                      <Cpu className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Fiber &amp; Cabling</div>
                      <div className="text-[10px] text-slate-400">Structured 10G</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  ABS
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">End-to-End Technology</div>
                  <div className="text-[11px] text-slate-400">Design · Deploy · Maintain</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sectors ribbon */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Infrastructure Engineered For Every Sector</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {targetSectors.map((sector) => (
              <span
                key={sector}
                className="px-3 py-1 rounded-lg bg-slate-800/70 border border-slate-700/70 text-slate-300 text-xs font-medium hover:border-slate-500 transition-colors"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
