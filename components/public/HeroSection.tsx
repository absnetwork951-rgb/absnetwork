'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface HeroSectionProps {
  settings?: SiteSettings;
}

const HERO_SLIDES = [
  '/hero.jpg',
  '/hero1.jpg',
  '/hero2.jpg',
  '/hero3.jpg',
  '/hero4.jpg',
];

const SLIDE_INTERVAL = 5000;

const heroTiles = [
  { icon: Zap, title: 'High Speed', description: 'Lightning fast internet' },
  { icon: ShieldCheck, title: 'Reliable', description: 'Stable connectivity' },
  { icon: Headphones, title: '24/7 Support', description: "We're always here" },
];

export default function HeroSection({ settings }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const headline =
    settings?.heroHeadline || 'Fast, Reliable Fiber Internet For Everyone';
  const subheadline =
    settings?.heroSubheadline ||
    'Experience ultra-high-speed fiber broadband engineered for modern homes and demanding enterprises. Buffer-free streaming, low-latency gaming, and rock-solid reliability backed by 24/7 dedicated support.';

  useEffect(() => {
    if (prefersReducedMotion || HERO_SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const fadeUp = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  return (
    <section className="relative overflow-hidden bg-slate-900">
      {/* Background image carousel */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {HERO_SLIDES.map((src, i) => {
          const isActive = i === active;
          const offset = i < active ? -36 : 36;
          return (
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={false}
              animate={
                isActive
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: offset }
              }
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          );
        })}

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/70 to-white/40" />
        <div className="absolute inset-0 bg-white/25 lg:bg-transparent" />
      </div>

      {/* Foreground content */}
      <div className="page-container relative z-10 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left space-y-8">
          <motion.div {...fadeUp} transition={{ ...fadeUp.animate.transition, delay: 0 }}>
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-blue-200/80 shadow-xs max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span className="text-xs font-semibold text-blue-700">
                Next-Gen Fiber Network •{' '}
                {settings?.companyName || 'ABS Network Broadband SMC-Pvt-Ltd'}
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
            className="text-lg text-slate-700 max-w-xl mx-auto lg:mx-0 leading-relaxed"
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
                className="flex items-center gap-3 bg-white/85 backdrop-blur border border-slate-200 rounded-xl px-4 py-3 shadow-sm text-left"
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
      </div>
    </section>
  );
}
