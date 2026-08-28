import React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBgClass?: string;
  href?: string;
  footer?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBgClass = 'bg-blue-50 text-blue-600',
  href,
  footer,
}: StatCardProps) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      {footer ? (
        <div className="text-sm text-slate-600 flex items-center gap-1">
          {footer}
          {href && <ArrowRight className="w-3.5 h-3.5 ml-auto" />}
        </div>
      ) : (
        href && <ArrowRight className="w-4 h-4 text-slate-400" />
      )}
    </>
  );

  const classes =
    'bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs transition-all group';

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:border-blue-500 hover:shadow-md`}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}