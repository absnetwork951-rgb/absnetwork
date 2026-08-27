'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Wifi, Check, Zap, ArrowRight, Shield, Router, Sparkles } from 'lucide-react';
import { BroadbandPackage } from '@/lib/db/types';

interface HomePackagesSectionProps {
  packages: BroadbandPackage[];
  totalCount: number;
}

export default function HomePackagesSection({ packages, totalCount }: HomePackagesSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 32,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const, // ABS smooth spring curve
      },
    },
  };

  const categoryLabels: Record<string, string> = {
    residential: 'Home Fiber',
    gaming: 'Pro Gaming',
    business: 'Business DIA',
    enterprise: 'Enterprise Apex',
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 font-bold">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            ABS HIGH-SPEED PACKAGES
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
            Featured <span className="font-black text-blue-600">Fiber Plans</span>
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Choose the ideal symmetrical fiber package for seamless streaming, competitive gaming, remote work, or enterprise offices.
          </p>
        </div>

        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-white hover:bg-blue-600 transition-all bg-white border border-blue-600 px-5 py-3 rounded-xl shadow-sm group"
        >
          <span>View All {totalCount} Packages</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Cascading Framer Motion Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {packages.map((pkg, index) => {
          const isPopular = pkg.isPopular;
          return (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                isPopular
                  ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10'
                  : 'bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md'
              }`}
            >
              {/* ABS Popular Tag */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm border border-blue-500">
                  ★ MOST POPULAR FIBER
                </div>
              )}

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                {/* Header & Speed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                      {categoryLabels[pkg.category] || pkg.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-mono font-bold">
                      <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                      <span>1:1 SYMMETRIC</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {pkg.shortDescription || 'Dedicated optical fiber with 24/7 prioritized carrier routing'}
                    </p>
                  </div>

                  {/* Speed Visual Block */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5 font-sans">
                        {pkg.speedMbps}
                        <span className="text-blue-600 text-lg font-bold">Mbps</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        {pkg.uploadSpeedMbps ? `${pkg.uploadSpeedMbps} Mbps Upload` : 'Equal Upload & Download'}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                      <Wifi className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-500 font-sans">PKR</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        {pkg.pricePkr.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500 font-sans">/{pkg.billingPeriod.toLowerCase()}</span>
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1.5 font-sans">
                      <span>{pkg.dataLimit} DATA</span>
                      <span>&bull;</span>
                      <span>
                        {pkg.installationFeePkr === 0 ? 'FREE SETUP' : `PKR ${pkg.installationFeePkr} SETUP`}
                      </span>
                    </div>
                  </div>

                  {/* Included Perks Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      INCLUDED WITH PLAN
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {pkg.routerIncluded && (
                        <li className="flex items-start gap-2 text-blue-700 font-medium">
                          <div className="w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Router className="w-2.5 h-2.5" />
                          </div>
                          <span>{pkg.routerDetails || 'Gigabit Dual-Band Optical Wi-Fi Router Included'}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Blue CTA Button */}
                <div className="pt-4">
                  <Link
                    href={`/contact?package=${encodeURIComponent(pkg.name)}&type=new_connection`}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Subscribe to {pkg.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
