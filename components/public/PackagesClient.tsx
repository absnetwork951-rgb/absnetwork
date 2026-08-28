'use client';

import React, { useState } from 'react';
import { Wifi } from 'lucide-react';
import { BroadbandPackage, SiteSettings } from '@/lib/db/types';
import PackageCard from './PackageCard';

interface PackagesClientProps {
  initialPackages: BroadbandPackage[];
  settings: SiteSettings;
}

const CATEGORIES = [
  { id: 'all', label: 'All Plans' },
  { id: 'residential', label: 'Home Fiber' },
  { id: 'gaming', label: 'Pro Gaming' },
  { id: 'business', label: 'Business' },
  { id: 'enterprise', label: 'Enterprise' },
];

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minSpeed, setMinSpeed] = useState<number>(0);

  const filtered = initialPackages.filter((pkg) => {
    if (selectedCategory !== 'all' && pkg.category !== selectedCategory) {
      return false;
    }
    if (pkg.speedMbps < minSpeed) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = selectedCategory !== 'all' || minSpeed > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setMinSpeed(0);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Browse plans</h2>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="flex overflow-x-auto md:flex-wrap items-center gap-2 pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
          <label htmlFor="min-speed" className="text-sm text-slate-700 font-medium whitespace-nowrap">
            Minimum speed: <strong className="text-blue-600">{minSpeed} Mbps</strong>
          </label>
          <input
            id="min-speed"
            type="range"
            min="0"
            max="500"
            step="10"
            value={minSpeed}
            onChange={(e) => setMinSpeed(Number(e.target.value))}
            className="w-full sm:w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <p className="text-xs text-slate-500">
          Showing <strong className="text-slate-700">{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'package' : 'packages'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl text-slate-400 flex items-center justify-center mx-auto">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No packages match your filters</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try lowering the minimum speed or resetting the category filter to see all plans.
          </p>
          <button onClick={resetFilters} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}