'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const CITY = 'Lahore';
const MAX_SUGGESTIONS = 30;

type Result =
  | { kind: 'success'; area: string }
  | { kind: 'error' }
  | null;

interface CoverageCheckSectionProps {
  /** null = still loading (Suspense fallback). */
  areas: string[] | null;
  /** true = Supabase read failed. */
  loadFailed?: boolean;
}

export default function CoverageCheckSection({ areas, loadFailed = false }: CoverageCheckSectionProps) {
  const [areaInput, setAreaInput] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [result, setResult] = useState<Result>(null);
  const [checking, setChecking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Unique list of every coverage area coming from Supabase. Sorted so the
  // dropdown presents the same stable order regardless of DB row order.
  const allAreas = useMemo(() => {
    if (!Array.isArray(areas)) return [];
    return Array.from(new Set(areas.map((a) => a.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [areas]);

  const loading = areas === null;
  const failed = loadFailed === true;
  const unavailable = !loading && !failed && allAreas.length === 0;

  const trimmed = areaInput.trim();
  const normalized = trimmed.toLowerCase();
  const suggestions = useMemo(() => {
    if (loading || failed || allAreas.length === 0) return [];
    if (normalized.length === 0) return allAreas.slice(0, MAX_SUGGESTIONS);
    return allAreas
      .filter((a) => a.toLowerCase().includes(normalized))
      .slice(0, MAX_SUGGESTIONS);
  }, [allAreas, normalized, loading, failed]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (area: string) => {
    setAreaInput(area);
    setOpen(false);
    setActiveIndex(-1);
    setResult(null);
  };

  const handleCheck = () => {
    if (!normalized || loading || failed || unavailable) {
      setResult(null);
      return;
    }
    setChecking(true);
    const match = allAreas.find((a) => a.toLowerCase() === normalized);
    window.setTimeout(() => {
      setResult(match ? { kind: 'success', area: match } : { kind: 'error' });
      setChecking(false);
      setOpen(false);
    }, 400);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % Math.max(suggestions.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? suggestions.length - 1 : i - 1
      );
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        choose(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const inputDisabled = loading || failed || unavailable;

  let notice: string | null = null;
  if (loading) notice = 'Loading areas...';
  else if (failed) notice = 'Unable to load coverage areas. Please try again.';
  else if (unavailable) notice = 'No coverage areas available.';

  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-200">
      <div className="page-container flex flex-col items-center text-center">
        <div className="max-w-2xl space-y-3">
          <span className="eyebrow justify-center">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Coverage
          </span>
          <h2 className="h2-section">
            Check <span className="text-blue-600">Availability</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Check if ABS Network is available in your area.
          </p>
        </div>

        <div
          ref={containerRef}
          className="mt-10 w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City selector */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="coverage-city" className="text-xs font-semibold text-slate-700">
                Select your area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="coverage-city"
                  name="city"
                  defaultValue={CITY}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600 appearance-none"
                >
                  <option value={CITY}>{CITY}</option>
                </select>
                <svg
                  className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Area search */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="coverage-area" className="text-xs font-semibold text-slate-700">
                Area
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="coverage-area"
                  type="text"
                  role="combobox"
                  aria-expanded={open && suggestions.length > 0}
                  aria-controls="coverage-suggestions"
                  aria-autocomplete="list"
                  autoComplete="off"
                  disabled={inputDisabled}
                  placeholder="Search your area..."
                  value={areaInput}
                  onChange={(e) => {
                    setAreaInput(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                    setResult(null);
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={onKeyDown}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {!inputDisabled && areaInput && (
                  <button
                    type="button"
                    aria-label="Clear area"
                    onClick={() => {
                      setAreaInput('');
                      setOpen(true);
                      setActiveIndex(-1);
                      setResult(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    &times;
                  </button>
                )}

                {open && suggestions.length > 0 && (
                  <ul
                    id="coverage-suggestions"
                    role="listbox"
                    aria-label="Area suggestions"
                    className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 py-1"
                  >
                    {suggestions.map((area, i) => (
                      <li key={area} role="option" aria-selected={i === activeIndex}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => choose(area)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
                            i === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{area}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleCheck}
              disabled={checking || !normalized || inputDisabled}
              className="btn-primary w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Check Availability
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Status notices */}
          {notice && (
            <div className="mt-4 p-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl">
              {loading ? (
                <Loader2 className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <p className="text-sm font-semibold text-slate-700 text-left">{notice}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={result.kind === 'success'
              ? 'mt-4 p-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl'
              : 'mt-4 p-4 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl'}>
              {result.kind === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-700 text-left">
                    Great! ABS Network is available in {result.area}.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <p className="text-sm font-semibold text-rose-700 text-left">
                    ABS Network coverage is not currently listed for this area.
                  </p>
                </>
              )}
            </div>
          )}

          <p className="mt-5 text-xs text-slate-500">
            Serving homes and businesses across {CITY}.
          </p>
        </div>
      </div>
    </section>
  );
}