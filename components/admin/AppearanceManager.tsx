'use client';

import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Box,
  Sparkles,
} from 'lucide-react';
import { updateAppearanceAction } from '@/lib/actions/admin-appearance';
import { useAdminTheme } from '@/components/admin/AdminThemeProvider';
import {
  type AdminAccentPreset,
  type AdminAppearancePreferences,
  type AdminDensity,
  type AdminMotion,
  type AdminRadius,
  type AdminThemeMode,
} from '@/lib/db/types';

const MODE_OPTIONS: { value: AdminThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const ACCENTS: { value: AdminAccentPreset; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: '#2563EB' },
  { value: 'indigo', label: 'Indigo', color: '#4F46E5' },
  { value: 'violet', label: 'Violet', color: '#7C3AED' },
  { value: 'emerald', label: 'Emerald', color: '#059669' },
  { value: 'rose', label: 'Rose', color: '#E11D48' },
  { value: 'amber', label: 'Amber', color: '#D97706' },
];

const DENSITIES: { value: AdminDensity; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const RADII: { value: AdminRadius; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

const MOTIONS: { value: AdminMotion; label: string }[] = [
  { value: 'reduced', label: 'Reduced' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'full', label: 'Full' },
];

export default function AppearanceManager() {
  const { appearance, resolvedMode, setAppearance } = useAdminTheme();
  const [local, setLocal] = useState<AdminAppearancePreferences>(appearance);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const applyLocal = (patch: Partial<AdminAppearancePreferences>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    setAppearance(patch);
    setNotification(null);
  };

  const persist = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const fd = new FormData();
      fd.set('mode', local.mode);
      fd.set('accent', local.accent);
      fd.set('density', local.density);
      fd.set('radius', local.radius);
      fd.set('motion', local.motion);
      const res = await updateAppearanceAction(fd);
      if (res.success && res.appearance) {
        setLocal(res.appearance);
        setAppearance(res.appearance);
        setNotification({ type: 'success', message: 'Appearance preferences saved for your account.' });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to save appearance.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Appearance</h2>
        <p className="text-sm text-slate-500">Choose how the admin panel looks for your account. Changes apply instantly and are saved per user.</p>
      </div>

      {notification && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border rounded-xl ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Theme mode */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Palette className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Theme Mode</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = local.mode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applyLocal({ mode: opt.value })}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-semibold transition-all ${
                    active
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {local.mode === 'system' && (
            <p className="text-xs text-slate-500">
              Currently rendering in <strong>{resolvedMode === 'dark' ? 'dark' : 'light'}</strong> mode based on your device preference.
            </p>
          )}
        </div>

        {/* Accent color */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Accent Color</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ACCENTS.map((acc) => (
              <button
                key={acc.value}
                type="button"
                title={acc.label}
                aria-label={`Accent ${acc.label}`}
                aria-pressed={local.accent === acc.value}
                onClick={() => applyLocal({ accent: acc.value })}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  local.accent === acc.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: acc.color }}
              >
                {local.accent === acc.value && (
                  <span className="w-3 h-3 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Density, radius, motion */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Box className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Layout &amp; Motion</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Density</span>
                <span className="text-[11px] text-slate-400 capitalize">{local.density}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DENSITIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => applyLocal({ density: d.value })}
                    aria-pressed={local.density === d.value}
                    className={`text-[11px] py-2.5 rounded-xl border font-semibold transition-all ${
                      local.density === d.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Corner Radius</span>
                <span className="text-[11px] text-slate-400 capitalize">{local.radius}</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {RADII.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => applyLocal({ radius: r.value })}
                    aria-pressed={local.radius === r.value}
                    className={`text-[11px] py-2.5 rounded-xl border font-semibold transition-all ${
                      local.radius === r.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Motion</span>
                <span className="text-[11px] text-slate-400 capitalize">{local.motion}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => applyLocal({ motion: m.value })}
                    aria-pressed={local.motion === m.value}
                    className={`text-[11px] py-2.5 rounded-xl border font-semibold transition-all ${
                      local.motion === m.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={persist}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save Appearance</>
          )}
        </button>
      </div>
    </div>
  );
}
