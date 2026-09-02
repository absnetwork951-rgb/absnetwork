'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Terminal,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  Building2,
  Activity,
  Headphones,
  type LucideIcon,
} from 'lucide-react';
import { ServiceItemData } from '@/data/services-data';
import { getWhatsAppLink } from '@/lib/whatsapp';

interface ServiceCardProps {
  service: ServiceItemData;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Network,
  Globe,
  Cpu,
  Router,
  Server,
  Terminal,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  Building2,
  Activity,
  Headphones,
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[service.iconName] || Network;
  const whatsappUrl = getWhatsAppLink(service.whatsappMessage);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-500/80 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Top Image Banner with Aspect Ratio & Zoom */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
        <Image
          src={service.image}
          alt={service.imageAlt || service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {/* Floating Category Badge & Icon */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span className="badge bg-white/95 text-slate-800 backdrop-blur-md border border-white/40 shadow-xs text-[10px] font-bold">
            {service.categoryName}
          </span>
          {service.badge && (
            <span className="badge bg-blue-600/90 text-white backdrop-blur-md border border-blue-400/40 shadow-xs text-[10px] font-bold">
              {service.badge}
            </span>
          )}
        </div>

        {/* Icon Floating Badge at bottom right of image */}
        <div className="absolute -bottom-3 right-5 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 group-hover:scale-110 transition-all">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          {service.subtitle && (
            <div className="eyebrow text-[11px] text-blue-600 font-bold tracking-wider">
              {service.subtitle}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {service.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {service.shortDescription}
          </p>
        </div>

        {/* Capabilities Checklist */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Key Capabilities
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {service.capabilities.slice(0, 4).map((cap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable detailed scope */}
        {service.detailedServices && service.detailedServices.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 cursor-pointer"
            >
              <span>{expanded ? 'Hide full engineering scope' : 'View full engineering scope'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expanded && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 animate-fadeIn">
                {service.detailedServices.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                      {group.groupTitle}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                      {group.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Action Button */}
        <div className="pt-3 border-t border-slate-100">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-blue-200" />
            <span>{service.cardCtaText || 'Contact Us'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
