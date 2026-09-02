'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Layers,
} from 'lucide-react';
import type { ServiceItem } from '@/lib/db/types';
import { getServiceCategoryLabel } from '@/lib/db/service-categories';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { svcIcon } from './service-icons';

interface ServiceCardProps {
  service: ServiceItem;
  /** Hide the WhatsApp deep-link and show detail-page CTA only. */
  whatsappOnly?: boolean;
}

export default function ServiceCard({ service, whatsappOnly = false }: ServiceCardProps) {
  const Icon = svcIcon(service.iconName);
  const whatsappUrl = getWhatsAppLink(
    service.whatsappMessage ||
      `Hello ABS Network, I am interested in your ${service.title} services.`,
    '923224180930'
  );
  const href = `/services/${service.slug}`;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-500/80 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Top Image Banner with Aspect Ratio & Zoom */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.imageAlt || `${service.title} - ABS Network`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
            <Icon className="w-14 h-14 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span className="badge bg-white/95 text-slate-800 backdrop-blur-md border border-white/40 shadow-xs text-[10px] font-bold">
            {getServiceCategoryLabel(service.category)}
          </span>
          {service.badge && (
            <span className="badge bg-blue-600/90 text-white backdrop-blur-md border border-blue-400/40 shadow-xs text-[10px] font-bold">
              {service.badge}
            </span>
          )}
        </div>

        <div className="absolute -bottom-3 right-5 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 group-hover:scale-110 transition-all">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <Link href={href} className="space-y-3 block" aria-label={service.title}>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
              {service.title}
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
            {service.shortDescription}
          </p>
        </Link>

        {/* Capabilities Checklist */}
        {(service.capabilities?.length || service.features?.length) ? (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Key Capabilities
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(service.capabilities?.length ? service.capabilities : service.features)
                .slice(0, 4)
                .map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-snug line-clamp-2">{cap}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Layers className="w-3.5 h-3.5" /> View full service details
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          {whatsappOnly ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-200" />
              <span>{service.ctaLabel || 'Chat on WhatsApp'}</span>
            </a>
          ) : (
            <>
              <Link
                href={href}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
