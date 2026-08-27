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

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-20">
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-mono uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-slate-900 tracking-tight">
              Contact <span className="font-black text-blue-600">ABS Network</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Have questions regarding broadband packages, corporate DIA leased lines, or enterprise networking equipment? Our specialized team is here to assist you 24/7.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Sales & Connections</div>
              <div className="text-base font-mono font-bold text-slate-900">{settings.phone}</div>
              <div className="text-xs text-slate-500">Mon - Sat (9:00 AM - 8:00 PM)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">24/7 NOC Helpline</div>
              <div className="text-base font-mono font-bold text-slate-900">{settings.supportPhone}</div>
              <div className="text-xs text-slate-500">Round-the-clock technician desk</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Official Email</div>
              <div className="text-sm font-mono font-bold text-slate-900 break-all">{settings.email}</div>
              <div className="text-xs text-slate-500">Sales: {settings.salesEmail}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Equipment Sales</div>
              <div className="text-base font-mono font-bold text-slate-900">{settings.whatsapp}</div>
              <div className="text-xs text-slate-500">WhatsApp product inquiries</div>
            </div>
          </div>

          {/* Main Grid: Form + Address Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <Suspense fallback={<div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xs h-96 animate-pulse" />}>
                <ContactForm />
              </Suspense>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Corporate Head Office Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Corporate Head Office</h3>
                    <div className="text-xs text-slate-500">{settings.companyName}</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-mono font-bold text-slate-500">Physical Address:</div>
                    <div className="text-slate-900 font-medium">{settings.address}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-mono font-bold text-slate-500">Operating Hours:</div>
                    <div className="text-slate-900 font-medium">{settings.businessHours}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-mono font-bold text-slate-500">Legal Registration:</div>
                    <div className="text-blue-600 font-mono font-bold">Registration #{settings.legalRegistration}</div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-widest text-center text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all rounded-xl shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start WhatsApp Chat ({settings.whatsapp})</span>
                </a>
              </div>

              {/* NOC Status Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  NOC Status: Fully Operational
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All upstream GPON nodes, BGP peering gateways, and network monitoring systems are operating normally with 0.00% packet loss.
                </p>
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="space-y-8 pt-8 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue-600 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="text-3xl font-light text-slate-900">
                Got Questions? <span className="font-black text-blue-600">We&apos;ve Got Answers</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                    <span className="text-blue-600 font-mono">Q.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
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
