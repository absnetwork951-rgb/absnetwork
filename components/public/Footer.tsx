import React from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Network,
  ArrowUpRight,
} from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Broadband Packages', href: '/packages' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact & Support', href: '/contact' },
  ];

  const infraLinks = [
    { name: 'Gigabit GPON FTTH', href: '/packages' },
    { name: 'Gaming Low-Latency', href: '/packages' },
    { name: 'Business & DIA', href: '/packages' },
    { name: 'Network Equipment Shop', href: '/shop' },
  ];

  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800 pt-16 pb-8 font-sans">
      <div className="page-container">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 sm:p-10 mb-16 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border-[20px] border-blue-600/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 text-left">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Need networking equipment?
              </h3>
              <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Browse our shop for professional-grade fiber optic cables, routers, switches, and networking hardware. Expert technical support included with every order.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-primary">
                <span>Get Connected</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="btn-secondary" style={{ backgroundColor: '#0A0F1E', borderColor: '#1D4ED8' }}>
                <Network className="w-4 h-4 text-blue-400" />
                <span>Visit Shop</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-900 border border-blue-500/50 flex items-center justify-center rounded-xl">
                <div className="w-4 h-4 border-2 border-blue-500 rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white -rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white">
                  ABS<span className="text-blue-500">.NETWORK</span>
                </span>
                <span className="text-xs text-neutral-500">Broadband SMC-Pvt-Ltd</span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              {settings.footerNotice}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {infraLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="hover:text-blue-400 transition-colors">
                  NOC Engineer Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">NOC Helpdesk</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-400">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-blue-400">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 NOC Monitoring</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            &copy; {currentYear} {settings.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Registration #{settings.legalRegistration}</span>
            <Link href="/admin/login" className="hover:text-neutral-300 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}