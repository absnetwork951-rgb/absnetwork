'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface HeroSectionProps {
  settings?: SiteSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const companyName = settings?.companyName || 'ABS Network Broadband';

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-white via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] bg-blue-400/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-[20%] w-[300px] h-[300px] bg-sky-300/[0.06] rounded-full blur-2xl pointer-events-none" />

      <div className="section-container w-full relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8 text-center lg:text-left">
            
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span className="text-xs font-semibold text-blue-700 tracking-wide">
                Next-Gen Fiber Network • {companyName}
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            >
              <h1 className="hero-heading font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Fast, Reliable
                <br />
                Fiber Internet
                <br />
                <span className="text-gradient-blue">For Everyone</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Experience ultra-high-speed fiber broadband engineered for modern homes and demanding enterprises. 
              Buffer-free streaming, low-latency gaming, and rock-solid reliability backed by 24/7 dedicated support.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/packages"
                className="btn-primary w-full sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary w-full sm:w-auto"
              >
                <span>Explore Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="pt-8 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">High Speed</div>
                  <div className="text-xs text-slate-500">Lightning fast internet</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Reliable</div>
                  <div className="text-xs text-slate-500">Stable connectivity</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">24/7 Support</div>
                  <div className="text-xs text-slate-500">We&apos;re always here</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Router Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[540px]">
              {/* Background glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-200/30 to-sky-100/20 rounded-full blur-3xl pointer-events-none" />
              
              {/* Router image */}
              <Image
                src="/download.jpg"
                alt="Modern fiber optic Wi-Fi router for high-speed broadband internet"
                width={800}
                height={600}
                className="relative z-10 w-full h-auto drop-shadow-2xl rounded-3xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
