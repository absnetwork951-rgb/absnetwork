'use client';

import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginAction, LoginActionResult } from '@/lib/actions/auth';

type LoginState = LoginActionResult | null;

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(loginAction, null);
  const errorMsg = state && !state.success && state.error ? state.error : null;

  useEffect(() => {
    if (state?.success) {
      window.location.replace('/admin/dashboard');
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 font-sans lg:grid lg:grid-cols-[2fr_3fr]">
      {/* Visual side — download.jpg (less than half of screen width on desktop) */}
      <div className="relative h-56 sm:h-72 lg:h-auto overflow-hidden">
        <Image
          src="/download.jpg"
          alt="ABS Network broadband infrastructure and high-speed fiber optic connectivity"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute inset-x-0 bottom-0 p-8 pointer-events-none">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-white">
              <div className="text-sm font-black tracking-tight leading-tight">ABS Network</div>
              <div className="text-[10px] text-blue-300 tracking-widest">Broadband SMC-Pvt-Ltd</div>
            </div>
          </div>
          <p className="text-white/90 text-sm font-semibold max-w-sm leading-snug">
            Fast, reliable fiber internet engineered for modern homes and demanding enterprises.
          </p>
        </div>
      </div>

      {/* Functional side — login form (larger portion) */}
      <div className="relative overflow-hidden flex items-center justify-center p-6 sm:p-10">
        {/* Ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(600px,120vw)] h-[300px] bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-8">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black tracking-tight text-white">ABS Network</div>
                <div className="text-[10px] text-blue-400 tracking-widest">Admin Control</div>
              </div>
            </Link>

            <h1 className="text-2xl font-light text-white">
              <span className="font-bold">Admin Portal</span> Sign In
            </h1>
            <p className="text-xs text-slate-400">
              Secure administrative control portal for ABS Network Broadband SMC-Pvt-Ltd.
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-[#0F141C] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {errorMsg && (
              <div
                role="alert"
                className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@absnetwork.pk"
                    disabled={pending}
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F14] border border-[#1E293B] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 rounded-xl disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete="current-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={pending}
                    className="w-full pl-10 pr-12 py-3 bg-[#0B0F14] border border-[#1E293B] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 rounded-xl disabled:opacity-60"
                    aria-describedby="password-visibility-hint"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span id="password-visibility-hint" className="sr-only">
                    {showPassword
                      ? 'Master password is currently visible.'
                      : 'Master password is currently hidden.'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 px-4 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back to Site */}
          <div className="text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back to ABS Network public site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
