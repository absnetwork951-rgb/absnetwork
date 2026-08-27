'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { loginAction } from '@/lib/actions/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);

    try {
      const res = await loginAction(formData);
      if (res.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md group-hover:bg-blue-700 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black tracking-tight text-white">ABS NETWORK</div>
              <div className="text-[10px] text-blue-400 font-mono tracking-wider">COMMAND CENTER</div>
            </div>
          </Link>

          <h1 className="text-2xl font-light text-white"><span className="font-bold">Admin Portal</span> Sign In</h1>
          <p className="text-xs text-slate-400">
            Secure administrative control portal for ABS Network Broadband SMCVP Pvt Ltd.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0F141C] border border-[#1E293B] rounded-2xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">Admin Email</label>
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0B0F14] border border-[#1E293B] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B0F14] border border-[#1E293B] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials &amp; Session...</span>
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
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors font-mono">
            &larr; Back to ABS Network Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
