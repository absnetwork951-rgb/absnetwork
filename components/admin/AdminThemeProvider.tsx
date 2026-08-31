'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  type AdminAccentPreset,
  type AdminAppearancePreferences,
  type AdminRadius,
} from '@/lib/db/types';

const DARK_MQ = '(prefers-color-scheme: dark)';

const subscribeSystemDark = (onChange: () => void) => {
  const mq = window.matchMedia(DARK_MQ);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};

const getSystemDarkSnapshot = () => window.matchMedia(DARK_MQ).matches;

const getSystemDarkServerSnapshot = () => false;

const ACCENT_COLORS: Record<AdminAccentPreset, { base: string; hover: string }> = {
  blue: { base: '#2563EB', hover: '#1D4ED8' },
  indigo: { base: '#4F46E5', hover: '#4338CA' },
  violet: { base: '#7C3AED', hover: '#6D28D9' },
  emerald: { base: '#059669', hover: '#047857' },
  rose: { base: '#E11D48', hover: '#BE123C' },
  amber: { base: '#D97706', hover: '#B45309' },
};

const RADIUS_VALUES: Record<AdminRadius, string> = {
  none: '0px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
};

interface AdminThemeContextValue {
  appearance: AdminAppearancePreferences;
  resolvedMode: 'light' | 'dark';
  setAppearance: (next: Partial<AdminAppearancePreferences>) => void;
  accentColors: { base: string; hover: string };
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function useAdminTheme(): AdminThemeContextValue {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return ctx;
}

interface AdminThemeProviderProps {
  children: React.ReactNode;
  defaultAppearance: AdminAppearancePreferences;
}

export default function AdminThemeProvider({
  children,
  defaultAppearance,
}: AdminThemeProviderProps) {
  const [appearance, setAppearanceState] = useState<AdminAppearancePreferences>(defaultAppearance);
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const resolvedMode: 'light' | 'dark' =
    appearance.mode === 'system' ? (systemDark ? 'dark' : 'light') : appearance.mode;

  const accentColors = ACCENT_COLORS[appearance.accent];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    el.setAttribute('data-admin-mode', resolvedMode);
    el.setAttribute('data-admin-theme-mode', appearance.mode);
    el.setAttribute('data-admin-accent', appearance.accent);
    el.setAttribute('data-admin-density', appearance.density);
    el.setAttribute('data-admin-radius', appearance.radius);
    el.setAttribute('data-admin-motion', appearance.motion);

    el.style.setProperty('--admin-accent', accentColors.base);
    el.style.setProperty('--admin-accent-hover', accentColors.hover);
    el.style.setProperty('--admin-radius-lg', RADIUS_VALUES[appearance.radius]);
    el.style.setProperty('--admin-radius-md', RADIUS_VALUES[appearance.radius]);
    el.style.setProperty('--admin-radius-sm', RADIUS_VALUES[appearance.radius]);

    const fontScale =
      appearance.density === 'compact'
        ? '0.94'
        : appearance.density === 'spacious'
          ? '1.06'
          : '1';
    el.style.setProperty('--admin-density-scale', fontScale);

    const motionEnabled =
      appearance.motion === 'reduced'
        ? 'none'
        : appearance.motion === 'full'
          ? 'all 0.18s ease'
          : 'all 0.12s ease';
    el.style.setProperty('--admin-motion', motionEnabled);
  }, [appearance, accentColors, resolvedMode]);

  const setAppearance = (next: Partial<AdminAppearancePreferences>) => {
    setAppearanceState((prev) => ({ ...prev, ...next }));
  };

  const value = useMemo<AdminThemeContextValue>(
    () => ({ appearance, resolvedMode, setAppearance, accentColors }),
    [appearance, resolvedMode, accentColors]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        ref={rootRef}
        data-admin-theme="true"
        className="min-h-screen flex flex-col lg:flex-row font-sans transition-[background-color,color]"
        style={{
          backgroundColor: 'var(--admin-bg, #F8FAFC)',
          color: 'var(--admin-text, #0F172A)',
        }}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
