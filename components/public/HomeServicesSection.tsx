'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import type { ServiceItem } from '@/lib/db/types';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { svcIcon } from '@/components/services/service-icons';

interface HomeServicesSectionProps {
  services?: ServiceItem[];
}

export default function HomeServicesSection({ services = [] }: HomeServicesSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="page-container space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Comprehensive Technology Solutions
            </span>
            <h2 className="h2-section">
              Our <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Technology solutions designed to keep your business connected, secure, and productive.
            </p>
          </div>

          <Link
            href="/services"
            className="btn-primary shrink-0 self-start md:self-auto inline-flex items-center gap-2 group"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = svcIcon(service.iconName);
            const whatsappUrl = getWhatsAppLink(
              service.whatsappMessage ||
                `Hello ABS Network, I am interested in your ${service.title} services.`,
              '923224180930'
            );
            const capabilities = service.capabilities?.length
              ? service.capabilities
              : service.features || [];

            return (
              <div
                key={service.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-500/80 transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Visual Header */}
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.imageAlt || `${service.title} - ABS Network`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
                      <Icon className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

                  {/* Badge */}
                  {service.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-white/95 text-slate-800 backdrop-blur-md border border-white/40 shadow-xs text-[10px] font-bold">
                        {service.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="absolute -bottom-2.5 right-4 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <Link href={`/services/${service.slug}`} className="space-y-2 block">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {service.shortDescription}
                    </p>
                  </Link>

                  {/* Key points */}
                  <ul className="space-y-1.5 pt-1 border-t border-slate-100 text-xs text-slate-700">
                    {capabilities.slice(0, 3).map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug text-[11px] text-slate-600">{cap}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                      title="Direct WhatsApp Inquiry"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-200" />
                      <span>Inquire Now</span>
                    </a>
                    <Link
                      href={`/services/${service.slug}`}
                      className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center"
                      title="View service details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom banner linking to services */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-slate-900">
              Need custom enterprise architecture or a managed service level agreement?
            </h4>
            <p className="text-xs text-slate-600">
              Our certified network engineers and systems administrators design tailor-fit solutions for any scale.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/services" className="btn-primary btn-sm">
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
