import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap, MessageCircle } from 'lucide-react';
import { BroadbandPackage } from '@/lib/db/types';
import { isContactPricing, getPackagePriceText } from '@/lib/db/pricing';
import { createWhatsAppInquiryUrl } from '@/lib/whatsapp';

interface PackageCardProps {
  pkg: BroadbandPackage;
  onSelect?: (pkg: BroadbandPackage) => void;
}

const categoryLabels: Record<string, string> = {
  residential: 'Home Fiber',
  gaming: 'Pro Gaming',
  business: 'Business',
  enterprise: 'Enterprise',
};

const defaultTaglines: Record<string, string> = {
  residential: 'Optical fiber with 24/7 prioritized carrier routing',
  gaming: 'Low-latency fiber routing engineered for competitive play',
  business: 'Low-latency fiber routing engineered for competitive play',
  enterprise: 'Carrier-grade bandwidth with custom BGP peering and SLA support',
};

export default function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const isPopular = pkg.isPopular;
  const isContact = isContactPricing(pkg);
  const isSymmetric = !pkg.uploadSpeedMbps || pkg.uploadSpeedMbps >= pkg.speedMbps;
  const upload = pkg.uploadSpeedMbps || pkg.speedMbps;
  const tagline = pkg.shortDescription || defaultTaglines[pkg.category] || '';
  const dataLabel =
    pkg.dataLimit && pkg.dataLimit.toLowerCase().includes('unlimited')
      ? `${pkg.dataLimit} DATA`
      : pkg.dataLimit;
  const setupLabel =
    pkg.installationFeePkr === 0
      ? 'FREE SETUP INCLUDED WITH PLAN'
      : `INSTALLATION ${pkg.installationFeePkr.toLocaleString()} PKR`;
  const ctaLabel = isContact ? 'Get Custom Quote' : `Subscribe to ${pkg.name}`;
  const whatsappMessage = isContact
    ? `Hi ABS Network, I am interested in the ${pkg.name} package (${pkg.speedMbps} Mbps). Please provide more details and availability.`
    : `Hi ABS Network, I am interested in the ${pkg.name} package (${pkg.speedMbps} Mbps, PKR ${pkg.pricePkr.toLocaleString()}). Please provide more details and availability.`;

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl bg-white overflow-hidden transition-shadow duration-300 ${
        isPopular
          ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10'
          : 'border border-slate-200 hover:border-blue-400 hover:shadow-lg'
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center text-[11px] font-bold tracking-[0.14em] py-1.5 uppercase">
          ★ Most Popular Fiber
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="badge badge-blue">{categoryLabels[pkg.category] || pkg.category}</span>
          {isSymmetric && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              1:1 Symmetric
            </span>
          )}
        </div>

        <div>
          <h3 className="h3-card">{pkg.name}</h3>
          {tagline && <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{tagline}</p>}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{pkg.speedMbps}</span>
          <span className="text-lg font-bold text-blue-600">Mbps</span>
          <span className="text-xs text-slate-500 ml-auto">{upload} Mbps Upload</span>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
            Unlimited Speed from 2am to 10am
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100">
          {isContact ? (
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{getPackagePriceText(pkg)}</p>
          ) : (
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
              PKR {pkg.pricePkr.toLocaleString()}
              <span className="text-sm font-semibold text-blue-600"> + TAX</span>
              <span className="text-sm font-semibold text-slate-400">/monthly</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-blue-50/70 border border-blue-100 rounded-lg px-3 py-2.5">
          <span>{dataLabel}</span>
          <span className="text-blue-400">•</span>
          <span className="text-blue-600">{setupLabel}</span>
        </div>

        <ul className="space-y-2.5">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="w-4 h-4 mt-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-200 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 mt-auto space-y-2">
          {onSelect ? (
            <button onClick={() => onSelect(pkg)} className="btn-primary w-full">
              <span>Inquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={`/contact?package=${encodeURIComponent(pkg.name)}&type=new_connection`}
              className="btn-primary w-full"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <a
            href={createWhatsAppInquiryUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Inquire about the ${pkg.name} package on WhatsApp`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Inquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
}