'use client';

import React from 'react';
import {
  Award,
  Briefcase,
  Network,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { WHY_CHOOSE_US_ITEMS } from '@/data/services-data';

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Briefcase,
  Network,
  Headphones,
  ShieldCheck,
  CheckCircle2,
};

export default function WhyChooseServices() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
      <div className="page-container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="eyebrow mx-auto">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Engineering Reliability
          </span>
          <h2 className="h2-section">
            Why Businesses Choose <span className="text-blue-600">ABS Network</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We bridge physical optical fiber cabling with high-level system administration,
            enterprise routing, and continuous NOC monitoring to keep your business operating without disruption.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US_ITEMS.map((item, idx) => {
            const Icon = ICON_MAP[item.iconName] || ShieldCheck;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-7 space-y-4 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="h3-card group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
