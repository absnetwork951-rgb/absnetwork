import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Network,
  Globe,
  ArrowUpRight,
  Headphones,
} from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 sm:p-10 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border-[20px] border-blue-600/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <span className="w-1.5 h-1.5 bg-blue-400" />
                SYSTEM ARCHITECTURE // GIGABIT CAPACITY
              </div>
              <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Need Networking Equipment?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Browse our shop for professional-grade fiber optic cables, routers, switches, and networking hardware. Expert technical support included with every order.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="px-6 py-3 font-bold text-[11px] uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all border border-blue-500 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <span>Get Connected</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 font-bold text-[11px] uppercase tracking-widest text-blue-300 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all rounded-xl flex items-center gap-2"
              >
                <Network className="w-3.5 h-3.5 text-blue-400" />
                <span>Visit Shop</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-900 border border-blue-500/50 flex items-center justify-center rounded-xl">
                <div className="w-4 h-4 border-2 border-blue-500 rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white -rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tighter uppercase text-white">
                  ABS.<span className="text-blue-500">NETWORK</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-mono">
                  Broadband SMCVP Pvt Ltd
                </span>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {settings.footerNotice}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 border border-neutral-800 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                REG #{settings.legalRegistration}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 border border-neutral-800 rounded-xl">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                IPV6 DUAL STACK
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em]">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Broadband Packages</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>NOC Contact &amp; Support</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em]">Infrastructure</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/packages" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Gigabit GPON FTTH</span>
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Gaming Ultra-Low Latency</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>NOC Contact &amp; Support</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Network Equipment Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>NOC Engineer Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em]">NOC Helpdesk</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-400 font-mono">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-blue-400 font-mono">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7/365 NOC Monitoring</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            &copy; {currentYear} {settings.companyName}. All rights reserved. Licensed Telecommunications Provider.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PKIX BGP OPERATIONAL
            </span>
            <Link href="/admin/login" className="hover:text-neutral-300 transition-colors">
              ADMIN LOGIN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
