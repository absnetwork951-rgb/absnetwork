import React from 'react';
import type { Metadata } from 'next';
import {
  Zap,
  Server,
  ShieldCheck,
  Router,
  Globe,
  Headphones,
  Wrench,
  Cloud,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getSiteSettings, getServices } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ABS Network Services | Internet, IT & Cloud Solutions',
  description: 'Enterprise broadband, managed IT, cloud and 24/7 NOC support services by ABS Network Broadband SMCVP Pvt Ltd in Islamabad.',
  openGraph: {
    title: 'ABS Network Services | Internet, IT & Cloud Solutions',
    description: 'End-to-end connectivity, IT and cloud services with 24/7 NOC support.',
  },
};

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Server,
  ShieldCheck,
  Router,
  Globe,
  Headphones,
  Wrench,
  Cloud,
};

export default function ServicesPage() {
  const settings = getSiteSettings();
  const services = getServices(true);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-mono uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Our Services
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-slate-900 tracking-tight">
              ABS Network <span className="font-black text-blue-600">Services</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              From symmetrical fiber backbone to enterprise IT, cloud, and round-the-clock NOC support - we power businesses and homes across Islamabad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length === 0 && (
              <p className="col-span-full text-center text-slate-500 text-sm">
                Services are being updated. Please check back soon.
              </p>
            )}

            {services.map((service) => {
              const Icon = ICON_MAP[service.iconName] || Wrench;
              return (
                <div
                  key={service.id}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    {service.badge && (
                      <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{service.title}</h2>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  {service.features.length > 0 && (
                    <ul className="mt-auto space-y-2.5 pt-2">
                      {service.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}