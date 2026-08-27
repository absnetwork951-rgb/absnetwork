'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Network,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Headphones,
  Lock,
} from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface HeaderProps {
  settings: SiteSettings;
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; href: string; badge?: string }[] = [
    { name: 'Home', href: '/' },
    { name: 'Packages', href: '/packages' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-300 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CONNECTED // NODE_01A &bull; 99.98% UPTIME
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              LICENSED ISP: {settings.legalRegistration}
            </span>
          </div>

          <div className="flex items-center gap-5 ml-auto text-xs">
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-blue-400" />
              <span className="font-mono">{settings.phone}</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] uppercase tracking-wider transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              WhatsApp NOC
            </a>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors pl-3 border-l border-slate-800 font-mono text-[11px] uppercase tracking-wider"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-slate-200/90 ${
          scrolled ? 'py-3 shadow-md shadow-slate-900/5' : 'py-4 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-xl shadow-sm group-hover:bg-blue-700 transition-colors">
              <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white -rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                ABS <span className="text-blue-600">BROADBAND</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-medium font-mono">
                Fiber &bull; Networks &bull; Equipment
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-700 h-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`h-full flex items-center gap-1.5 transition-colors relative py-1 whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'hover:text-blue-600 text-slate-700'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/shop"
              prefetch={true}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Network className="w-3.5 h-3.5 text-blue-500" />
              <span>Shop Equipment</span>
            </Link>

            <Link
              href="/contact"
              prefetch={true}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-500/20 hover:shadow-md flex items-center gap-1.5 group"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl text-center text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 flex items-center justify-center gap-2"
            >
              <Network className="w-4 h-4 text-blue-500" />
              <span>Browse Shop</span>
            </Link>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-3 px-1 border-t border-slate-100">
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-blue-600">
                <Headphones className="w-3.5 h-3.5 text-blue-600" />
                <span>NOC HELPLINE</span>
              </a>
              <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="hover:text-blue-600 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>ADMIN PORTAL</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
