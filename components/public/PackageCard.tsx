import React from 'react';
import Link from 'next/link';
import { Wifi, Check, Zap, ArrowRight, Router } from 'lucide-react';
import { BroadbandPackage } from '@/lib/db/types';

interface PackageCardProps {
  pkg: BroadbandPackage;
  onSelect?: (pkg: BroadbandPackage) => void;
}

export default function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const isPopular = pkg.isPopular;

  const categoryLabels: Record<string, string> = {
    residential: 'Home Fiber',
    gaming: 'Pro Gaming',
    business: 'Business DIA',
    enterprise: 'Enterprise Apex',
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
        isPopular
          ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10'
          : 'bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Recommended Tag */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm border border-blue-500">
          ★ MOST POPULAR FIBER
        </div>
      )}

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        {/* Header: Name, Category, Speed */}
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
              {pkg.shortDescription || 'Optical fiber connection with 24/7 priority NOC link'}
            </p>
          </div>

          {/* Speed Display Badge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between">
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

          {/* Features Checklist */}
          <div className="space-y-2.5 pt-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              INCLUDED PERKS
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
                  <span>{pkg.routerDetails || 'Optical Wi-Fi Router Included'}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          {onSelect ? (
            <button
              onClick={() => onSelect(pkg)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Get {pkg.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href={`/contact?package=${encodeURIComponent(pkg.name)}&type=new_connection`}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Subscribe Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
