'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface HeroSectionProps {
  settings?: SiteSettings;
}

const heroTiles = [
  { icon: Zap, title: 'High Speed', description: 'Lightning fast internet' },
  { icon: ShieldCheck, title: 'Reliable', description: 'Stable connectivity' },
  { icon: Headphones, title: '24/7 Support', description: "We're always here" },
];

export default function HeroSection({ settings }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const headline =
    settings?.heroHeadline || 'Fast, Reliable Fiber Internet For Everyone';
  const subheadline =
    settings?.heroSubheadline ||
    'Experience ultra-high-speed fiber broadband engineered for modern homes and demanding enterprises. Buffer-free streaming, low-latency gaming, and rock-solid reliability backed by 24/7 dedicated support.';

  const fadeUp = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-slate-50">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] bg-blue-400/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-[20%] w-[300px] h-[300px] bg-sky-300/[0.06] rounded-full blur-2xl pointer-events-none" />

      <div className="page-container relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <motion.div {...fadeUp} transition={{ ...fadeUp.animate.transition, delay: 0 }}>
              <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs max-w-full">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="text-xs font-semibold text-blue-700">
                  Next-Gen Fiber Network •{' '}
                  {settings?.companyName || 'ABS Network Broadband SMCVP Pvt Ltd'}
                </span>
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.animate.transition, delay: 0.1 }}
              className="hero-heading font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            >
              {headline}
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.animate.transition, delay: 0.2 }}
              className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {subheadline}
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.animate.transition, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link href="/packages" className="btn-primary btn-lg w-full sm:w-auto">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/packages" className="btn-secondary btn-lg w-full sm:w-auto">
                <span>Explore Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.animate.transition, delay: 0.45 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {heroTiles.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3 shadow-xs text-left"
                >
                  <span className="w-9 h-9 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{title}</p>
                    <p className="text-xs text-slate-500 leading-tight truncate">{description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[540px]">
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-200/30 to-sky-100/20 rounded-full blur-3xl pointer-events-none" />
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