import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  Phone,
  Mail,
  MapPin,
  Headphones,
  MessageSquare,
  HelpCircle,
  Globe,
} from 'lucide-react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageHeader from '@/components/public/PageHeader';
import ContactForm from '@/components/public/ContactForm';
import { getSiteSettings } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Contact ABS Network Broadband | 24/7 Helpline & Sales Desk',
  description: 'Contact ABS Network Broadband SMCVP Pvt Ltd for new fiber connections, dedicated corporate leased lines, enterprise networking solutions, and 24/7 NOC technical support.',
  openGraph: {
    title: 'Contact ABS Network Broadband | 24/7 Support & Sales',
    description: 'Get in touch with ABS Network support and sales teams across Islamabad & Rawalpindi.',
  },
};

export default function ContactPage() {
  const settings = getSiteSettings();

  const faqs = [
    {
      q: 'How fast can a new ABS Network fiber connection be installed?',
      a: 'In all covered sectors in Islamabad and Rawalpindi, residential and standard business fiber installations are completed within 24 to 48 hours following application confirmation.',
    },
    {
      q: 'Does ABS Network impose any Fair Usage Policy (FUP) or download caps?',
      a: 'No. All ABS Network fiber packages are truly unlimited with no data caps, no nighttime bandwidth throttling, and symmetric 1:1 upload/download speeds.',
    },
    {
      q: 'How do I get enterprise networking equipment for my office?',
      a: 'ABS Network supplies professional-grade fiber optic equipment, managed switches, enterprise access points, and structured cabling solutions. Visit our shop page or contact our sales team for competitive pricing and installation support.',
    },
    {
      q: 'How can I reach emergency technical support during a network fault?',
      a: 'Our dedicated Network Operations Center (NOC) operates 24 hours a day, 7 days a week. You can reach on-duty network engineers directly by calling our helpline or submitting a ticket through this form.',
    },
  ];

  const contactCards = [
    {
      icon: Phone,
      label: 'Sales & Connections',
      value: settings.phone,
      note: 'Mon – Sat, 9:00 AM – 8:00 PM',
    },
    {
      icon: Headphones,
      label: '24/7 NOC Helpline',
      value: settings.supportPhone,
      note: 'Round-the-clock technician desk',
    },
    {
      icon: Mail,
      label: 'Official Email',
      value: settings.email,
      note: `Sales: ${settings.salesEmail}`,
    },
    {
      icon: Globe,
      label: 'Equipment Sales',
      value: settings.whatsapp,
      note: 'WhatsApp product inquiries',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-[var(--header-h)] pb-24">
        <div className="page-container space-y-16">
          <div className="pt-12 md:pt-16">
            <PageHeader
              eyebrow="Get in Touch"
              title={
                <>
                  Contact <span className="text-blue-600">ABS Network</span>
                </>
              }
              description="Have questions regarding broadband packages, corporate DIA leased lines, or enterprise networking equipment? Our specialized team is here to assist you 24/7."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{card.label}</div>
                  <div className="mt-1 text-sm text-blue-700 font-medium break-all">{card.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{card.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <Suspense fallback={<div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs h-96 animate-pulse" />}>
                <ContactForm />
              </Suspense>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="h3-card">Corporate Head Office</h3>
                    <div className="text-xs text-slate-500">{settings.companyName}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-700">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address</div>
                    <div className="mt-1 font-medium text-slate-900">{settings.address}</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operating hours</div>
                    <div className="mt-1 font-medium text-slate-900">{settings.businessHours}</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Legal registration</div>
                    <div className="mt-1 font-medium text-slate-900">Registration #{settings.legalRegistration}</div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Network operational
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  All upstream GPON nodes, peering gateways, and network monitoring systems are operating normally.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-4 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="eyebrow justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
                FAQ
              </span>
              <h2 className="h2-section">
                Got questions? <span className="text-blue-600">We&apos;ve got answers</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                    <span className="text-blue-600">Q.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}