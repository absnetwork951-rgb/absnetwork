import React from 'react';
import { Smartphone, Database, Wifi, Tv, CreditCard } from 'lucide-react';

const CATEGORIES = [
  { title: 'Phone & Device', icon: Smartphone },
  { title: 'Data Quota', icon: Database },
  { title: 'Fibre Broadband', icon: Wifi },
  { title: 'TV Channels', icon: Tv },
  { title: 'Prepaid', icon: CreditCard },
];

export default function VisualCategoryCards() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="page-container">

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-4">
          {CATEGORIES.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-4 text-center select-none"
            >
              <span className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center rounded-2xl transition-colors">
                <Icon className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-slate-900 leading-snug">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
