'use client';

import React, { useState } from 'react';
import {
  Wifi,
} from 'lucide-react';
import { BroadbandPackage, SiteSettings } from '@/lib/db/types';
import PackageCard from './PackageCard';

interface PackagesClientProps {
  initialPackages: BroadbandPackage[];
  settings: SiteSettings;
}

export default function PackagesClient({ initialPackages, settings }: PackagesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minSpeed, setMinSpeed] = useState<number>(0);

  const categories = [
    { id: 'all', label: 'All Plans' },
    { id: 'residential', label: 'Residential Home' },
    { id: 'gaming', label: 'Pro Gaming' },
    { id: 'business', label: 'Business DIA' },
    { id: 'enterprise', label: 'Enterprise Apex' },
  ];

  const filtered = initialPackages.filter((pkg) => {
    if (selectedCategory !== 'all' && pkg.category !== selectedCategory) {
      return false;
    }
    if (pkg.speedMbps < minSpeed) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-16">
      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Speed Slider Filter */}
        <div className="flex items-center gap-4 w-full md:w-auto bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-700 font-semibold whitespace-nowrap">
            Min Speed: <strong className="text-blue-600">{minSpeed} Mbps</strong>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="10"
            value={minSpeed}
            onChange={(e) => setMinSpeed(Number(e.target.value))}
            className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          {minSpeed > 0 && (
            <button
              onClick={() => setMinSpeed(0)}
              className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Package Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4">
          <Wifi className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No packages match the selected criteria</h3>
          <p className="text-xs text-slate-500">Try lowering the minimum speed slider or choose &apos;All Plans&apos;.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setMinSpeed(0);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-xl shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}

    </div>
  );
}
