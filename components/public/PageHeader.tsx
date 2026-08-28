import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
}

export default function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700">
          {eyebrow}
        </span>
      )}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
        {title}
      </h1>
      {description && <p className="text-base text-slate-600 leading-relaxed">{description}</p>}
    </div>
  );
}