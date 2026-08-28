'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Network, Menu, X, ArrowRight, Headphones, Lock } from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';

interface HeaderProps {
  settings: SiteSettings;
}

const NAV_LINKS: { name: string; href: string }[] = [
  { name: 'Home', href: '/' },
  { name: 'Packages', href: '/packages' },
  { name: 'Shop', href: '/shop' },
  { name: 'Contact', href: '/contact' },
];

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const toggleMobile = () => setMobileOpen((open) => !open);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top utility strip */}
      <div className="h-8 bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="page-container h-full flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Network Operational
          </span>
          <div className="flex items-center gap-5 text-xs">
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-blue-400" />
              <span>{settings.phone}</span>
            </a>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-shadow ${
          scrolled ? 'py-2 shadow-md shadow-slate-900/5' : 'py-2 shadow-xs'
        }`}
      >
        <div className="page-container flex items-center justify-between gap-4 h-12">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-xl shadow-sm group-hover:bg-blue-700 transition-colors">
              <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white -rotate-45" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black tracking-tight text-slate-900">
                ABS <span className="text-blue-600">Broadband</span>
              </span>
              <span className="text-xs text-slate-500">
                Fiber · Networks · Equipment
              </span>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 h-full">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative h-full flex items-center px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-4 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/shop"
              className="btn-secondary btn-sm"
            >
              <Network className="w-4 h-4 text-blue-500" />
              <span>Shop Equipment</span>
            </Link>
            <Link href="/contact" className="btn-primary btn-sm">
              <span>Check Availability</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={toggleMobile}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-white border-b border-slate-200 shadow-xl animate-slideDown"
        >
          <nav aria-label="Mobile navigation" className="page-container py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <ArrowRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="page-container pb-6 space-y-2.5">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-between pt-3 px-1">
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600">
                <Headphones className="w-3.5 h-3.5 text-blue-600" />
                <span>Call support</span>
              </a>
              <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600">
                <Lock className="w-3 h-3" />
                <span>Admin portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}