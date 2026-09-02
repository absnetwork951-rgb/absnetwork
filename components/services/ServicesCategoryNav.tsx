'use client';

import React from 'react';
import {
  Layers,
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/db/service-categories';
import Link from 'next/link';

interface ServicesCategoryNavProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  serviceCounts: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Layers,
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
};

export default function ServicesCategoryNav({
  activeCategory,
  onSelectCategory,
  serviceCounts,
}: ServicesCategoryNavProps) {
  return (
    <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200 shadow-xs py-3.5">
      <div className="page-container">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <button
            onClick={() => onSelectCategory('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-1'
                : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeCategory === 'all' ? 'text-white' : 'text-slate-500'}`} />
            <span>All Services</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${activeCategory === 'all' ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {serviceCounts['all'] ?? 0}
            </span>
          </button>

          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName || ''] || Layers;
            const isActive = activeCategory === cat.slug;
            const count = serviceCounts[cat.slug] ?? 0;

            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                    isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
