'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sun,
  Activity,
} from 'lucide-react';
import { SiteSettings } from '@/lib/db/types';
import { updateSiteSettingsAction } from '@/lib/actions/admin-settings';

interface SettingsManagerClientProps {
  initialSettings: SiteSettings;
}

export default function SettingsManagerClient({
  initialSettings,
}: SettingsManagerClientProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await updateSiteSettingsAction(formData);
      if (res.success && res.settings) {
        setSettings(res.settings);
        setNotification({ type: 'success', message: 'Global portal settings updated successfully!' });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to update settings' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Site Settings</h2>
        <p className="text-sm text-slate-500">Corporate brand details, hotlines, addresses, statistics counters, and social media</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company Identity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Corporate Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Official Company Legal Name</label>
              <input
                name="companyName"
                type="text"
                required
                defaultValue={settings.companyName}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Company Tagline / Hero Subheadline</label>
              <textarea
                name="heroSubheadline"
                rows={2}
                defaultValue={settings.heroSubheadline}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none resize-none rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Corporate Registration Number</label>
              <input
                name="legalRegistration"
                type="text"
                defaultValue={settings.legalRegistration}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Business Operating Hours</label>
              <input
                name="businessHours"
                type="text"
                defaultValue={settings.businessHours}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Head Office Physical Address</label>
              <input
                name="address"
                type="text"
                defaultValue={settings.address}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Numbers & Emails */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Phone className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Contact &amp; Helplines</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Primary Phone (Sales)</label>
              <input
                name="phone"
                type="text"
                defaultValue={settings.phone}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">24/7 NOC Support Phone</label>
              <input
                name="supportPhone"
                type="text"
                defaultValue={settings.supportPhone}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">WhatsApp Number</label>
              <input
                name="whatsapp"
                type="text"
                defaultValue={settings.whatsapp}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Official General Email</label>
              <input
                name="email"
                type="email"
                defaultValue={settings.email}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Sales Inquiries Email</label>
              <input
                name="salesEmail"
                type="email"
                defaultValue={settings.salesEmail}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NOC Technical Support Email</label>
              <input
                name="supportEmail"
                type="email"
                defaultValue={settings.supportEmail}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Live Statistics Counters & Shop Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Metrics &amp; Shop Banner</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Fiber Coverage (KM)</label>
              <input
                name="statsFiberCoverageKm"
                type="number"
                defaultValue={settings.statsFiberCoverageKm}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Active Subscribers</label>
              <input
                name="statsActiveSubscribers"
                type="number"
                defaultValue={settings.statsActiveSubscribers}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Uptime SLA (%)</label>
              <input
                name="statsUptimeGuarantee"
                type="text"
                defaultValue={settings.statsUptimeGuarantee}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Shop Product Count</label>
              <input
                name="statsShopProductCount"
                type="number"
                defaultValue={settings.statsShopProductCount}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-4">
              <label className="text-xs font-semibold text-slate-700">Shop Banner Text</label>
              <input
                name="shopBannerText"
                type="text"
                defaultValue={settings.shopBannerText}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Site Configurations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
