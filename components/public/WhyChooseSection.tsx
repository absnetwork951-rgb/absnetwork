import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Gauge,
  ShieldCheck,
  Layers,
  Headphones,
  MessageSquare,
  Wifi,
  Activity,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Gauge,
    badgeClass: 'bg-blue-50 border-blue-200 text-blue-600',
    title: 'High-Speed Connectivity',
    description:
      'Experience fast and consistent internet speeds designed for modern browsing, streaming, gaming, remote work, and business needs.',
  },
  {
    icon: ShieldCheck,
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: 'Reliable Connection',
    description:
      'Our modern fiber infrastructure is engineered for dependable connectivity and stable performance, even during demanding usage.',
  },
  {
    icon: Layers,
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-600',
    title: 'Flexible Broadband Solutions',
    description:
      'Choose broadband solutions designed around different household, professional, and business connectivity requirements.',
  },
  {
    icon: Headphones,
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-600',
    title: '24/7 Customer Support',
    description:
      'Our support team is available to help customers resolve connectivity issues and maintain a smooth internet experience.',
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-200">
      <div className="page-container">
        {/* Row 1 — Why Choose ABS Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-5">
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Why ABS Network
            </span>
            <h2 className="h2-section">
              Why Choose <span className="text-blue-600">ABS Network?</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              ABS Network is committed to delivering fast, reliable, and affordable
              internet solutions for homes and businesses. Our fiber-powered network
              is built to provide stable connectivity, consistent performance, and a
              seamless online experience.
            </p>
            <div className="pt-2">
              <Link href="/contact" className="btn-primary">
                <MessageSquare className="w-4 h-4" />
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/30 to-sky-100/20 rounded-3xl blur-2xl pointer-events-none" />
            <Image
              src="/why.jpg"
              alt="ABS Network high-speed fiber broadband connectivity for homes and businesses"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
              className="relative z-10 w-full h-auto aspect-[4/3] object-cover rounded-2xl border border-slate-200 shadow-xl"
            />
          </div>
        </div>

        {/* Row 2 — What Makes ABS Network Better? */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/20 to-sky-100/20 rounded-3xl blur-2xl pointer-events-none" />
            <Image
              src="/why1.jpg"
              alt="ABS Network reliable fiber optic internet infrastructure"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
              className="relative z-10 w-full h-auto aspect-[4/3] object-cover rounded-2xl border border-slate-200 shadow-xl"
            />
          </div>

          <div className="space-y-5 order-1 lg:order-2">
            <span className="eyebrow">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Why ABS Network
            </span>
            <h2 className="h2-section">
              What Makes ABS Network <span className="text-blue-600">Better?</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              ABS Network pairs modern, fiber-powered infrastructure with consistent
              speeds and dependable service. From affordable broadband plans for
              homes to flexible connectivity solutions for growing businesses, we are
              built around stable performance and genuine customer-focused support.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-700 pt-1">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <Wifi className="w-4 h-4 text-blue-600" /> Modern fiber network
              </span>
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <Activity className="w-4 h-4 text-emerald-600" /> Stable, consistent performance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — Feature Cards Only */}
      <div className="mt-20 md:mt-28 bg-slate-50 border-y border-slate-200">
        <div className="page-container py-16 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, badgeClass, title, description }) => (
              <div
                key={title}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs"
              >
                <div className={`w-10 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-xl ${badgeClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="h3-card">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
