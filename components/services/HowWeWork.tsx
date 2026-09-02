'use client';

import React from 'react';
import {
  Search,
  Compass,
  Cpu,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';
import { PROCESS_STEPS } from '@/data/services-data';

const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  Compass,
  Cpu,
  LifeBuoy,
};

export default function HowWeWork() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="page-container space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="eyebrow mx-auto">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Execution Methodology
          </span>
          <h2 className="h2-section">
            How We <span className="text-blue-600">Work</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            A structured four-step engineering lifecycle designed to ensure flawless network deployment, minimal downtime, and long-term infrastructure stability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = ICON_MAP[step.iconName] || Search;
            return (
              <div
                key={step.step}
                className="relative bg-slate-50 border border-slate-200/90 rounded-2xl p-7 space-y-4 hover:border-blue-500 hover:bg-white hover:shadow-lg transition-all group"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm group-hover:bg-blue-700 transition-colors shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-slate-300 group-hover:text-blue-600/30 transition-colors font-mono">
                    {step.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="h3-card group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector indicator on desktop */}
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold pointer-events-none">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
