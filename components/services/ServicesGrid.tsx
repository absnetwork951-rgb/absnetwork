'use client';

import React, { useState, useMemo } from 'react';
import { SERVICES_DATA, ServiceItemData } from '@/data/services-data';
import ServicesCategoryNav from './ServicesCategoryNav';
import ServiceCard from './ServiceCard';
import { Network, Search } from 'lucide-react';

interface ServicesGridProps {
  initialServices?: ServiceItemData[];
}

export default function ServicesGrid({ initialServices }: ServicesGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const services = initialServices && initialServices.length > 0 ? initialServices : SERVICES_DATA;

  // Compute counts per category
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach((s) => {
      counts[s.categorySlug] = (counts[s.categorySlug] || 0) + 1;
    });
    return counts;
  }, [services]);

  // Filter services by category and optional search query
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' || service.categorySlug === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = service.title.toLowerCase().includes(q);
      const inDesc = service.shortDescription.toLowerCase().includes(q);
      const inCap = service.capabilities.some((c) => c.toLowerCase().includes(q));

      return inTitle || inDesc || inCap;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div id="services-catalog" className="space-y-8">
      {/* Category Navigation Bar */}
      <ServicesCategoryNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        serviceCounts={serviceCounts}
      />

      <div className="page-container space-y-8">
        {/* Filter / Search Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div>
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Service Catalog
            </span>
            <h2 className="h2-section mt-1">
              Engineering &amp; Infrastructure Capabilities
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services, tech, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <Network className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              No services found matching your criteria.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
