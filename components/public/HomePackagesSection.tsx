'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BroadbandPackage } from '@/lib/db/types';
import PackageCard from './PackageCard';

interface HomePackagesSectionProps {
  packages: BroadbandPackage[];
  totalCount: number;
}

export default function HomePackagesSection({ packages, totalCount }: HomePackagesSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.1 });
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForceVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const show = inView || forceVisible;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="eyebrow">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Featured Fiber Plans
          </span>
          <h2 className="h2-section">
            Transparent pricing, <span className="text-blue-600">symmetrical speed</span>
          </h2>
          <p className="text-sm text-slate-600">
            Choose the ideal fiber package for seamless streaming, competitive gaming, remote work, or enterprise offices.
          </p>
        </div>

        <Link href="/packages" className="btn-secondary shrink-0">
          <span>View All {totalCount} Packages</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <motion.div
        ref={gridRef}
        initial={{ opacity: 0, y: 24 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
      >
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </motion.div>
    </div>
  );
}