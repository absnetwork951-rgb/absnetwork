'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  type LucideIcon,
  Network,
  Cpu,
  Router,
  Server,
  Wrench,
  ShieldCheck,
  Wifi,
  Cable,
  Video,
  Code,
  Building2,
  Headphones,
  Activity,
  Zap,
  Terminal,
} from 'lucide-react';
import type { ServiceItem, AdminRole } from '@/lib/db/types';
import { SERVICE_CATEGORIES } from '@/lib/db/service-categories';
import { saveServiceAction } from '@/lib/actions/admin-services';
import { slugify } from '@/lib/slug';

interface ServiceEditorFullPageProps {
  initialService?: ServiceItem | null;
  actorRole: AdminRole;
}

const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'Network', Icon: Network },
  { name: 'Globe', Icon: Globe },
  { name: 'Cpu', Icon: Cpu },
  { name: 'Router', Icon: Router },
  { name: 'Server', Icon: Server },
  { name: 'Wrench', Icon: Wrench },
  { name: 'ShieldCheck', Icon: ShieldCheck },
  { name: 'Wifi', Icon: Wifi },
  { name: 'Cable', Icon: Cable },
  { name: 'Video', Icon: Video },
  { name: 'Code', Icon: Code },
  { name: 'Building2', Icon: Building2 },
  { name: 'Headphones', Icon: Headphones },
  { name: 'Activity', Icon: Activity },
  { name: 'Zap', Icon: Zap },
  { name: 'Terminal', Icon: Terminal },
];

export default function ServiceEditorFullPage({
  initialService,
}: ServiceEditorFullPageProps) {
  const router = useRouter();
  const isNew = !initialService || !initialService.id;

  const [activeTab, setActiveTab] = useState<'general' | 'capabilities' | 'media' | 'cta' | 'publishing'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialService?.title || '');
  const [slug, setSlug] = useState(initialService?.slug || '');
  const [category, setCategory] = useState(initialService?.category || 'it');
  const [shortDescription, setShortDescription] = useState(initialService?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialService?.fullDescription || '');
  const [iconName, setIconName] = useState(initialService?.iconName || 'Network');
  const [badge, setBadge] = useState(initialService?.badge || '');
  const [capabilities, setCapabilities] = useState<string[]>(
    initialService?.capabilities && initialService.capabilities.length > 0
      ? initialService.capabilities
      : ['']
  );
  const [imageUrl, setImageUrl] = useState(initialService?.imageUrl || '/net2.jpg');
  const [imageAlt, setImageAlt] = useState(initialService?.imageAlt || '');
  const [ctaLabel, setCtaLabel] = useState(initialService?.ctaLabel || 'Contact Us');
  const [whatsappMessage, setWhatsappMessage] = useState(
    initialService?.whatsappMessage ||
      'Hello ABS Network, I am interested in your services and would like to discuss my requirements.'
  );
  const [isFeatured, setIsFeatured] = useState(initialService?.isFeatured || false);
  const [isPublished, setIsPublished] = useState(initialService?.isPublished !== false);
  const [displayOrder, setDisplayOrder] = useState(initialService?.displayOrder || 1);
  const [seoTitle, setSeoTitle] = useState(initialService?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialService?.seoDescription || '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isNew || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleAddCapability = () => {
    setCapabilities([...capabilities, '']);
  };

  const handleRemoveCapability = (idx: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== idx));
  };

  const handleCapabilityChange = (idx: number, val: string) => {
    const next = [...capabilities];
    next[idx] = val;
    setCapabilities(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      if (initialService?.id) {
        formData.append('id', initialService.id);
      }
      formData.append('title', title);
      formData.append('slug', slug || slugify(title));
      formData.append('category', category);
      formData.append('shortDescription', shortDescription);
      formData.append('fullDescription', fullDescription || shortDescription);
      formData.append('iconName', iconName);
      if (badge) formData.append('badge', badge);
      formData.append(
        'capabilities',
        capabilities
          .map((c) => c.trim())
          .filter(Boolean)
          .join('\n')
      );
      if (imageUrl) formData.append('imageUrl', imageUrl);
      if (imageAlt) formData.append('imageAlt', imageAlt);
      if (ctaLabel) formData.append('ctaLabel', ctaLabel);
      if (whatsappMessage) formData.append('whatsappMessage', whatsappMessage);
      formData.append('isFeatured', isFeatured ? 'true' : 'false');
      formData.append('isPublished', isPublished ? 'true' : 'false');
      formData.append('displayOrder', String(displayOrder));
      if (seoTitle) formData.append('seoTitle', seoTitle);
      if (seoDescription) formData.append('seoDescription', seoDescription);

      const res = await saveServiceAction(formData);
      if (!res.success) {
        setError(res.error || 'Failed to save service.');
        return;
      }

      setSuccessMsg('Service saved successfully!');
      setTimeout(() => {
        router.push('/admin/services');
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Information', icon: Layers },
    { id: 'capabilities', label: 'Capabilities & Scope', icon: Sparkles },
    { id: 'media', label: 'Media & Branding', icon: ImageIcon },
    { id: 'cta', label: 'CTA & WhatsApp', icon: MessageSquare },
    { id: 'publishing', label: 'Publishing & SEO', icon: Globe },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb / Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isNew ? 'Create New Service' : `Edit: ${initialService?.title}`}
            </h1>
            <p className="text-xs text-slate-500">
              {isNew
                ? 'Add an enterprise IT, networking or digital service to the ABS Network catalog.'
                : `Managing service ID: ${initialService?.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/services" className="btn-secondary btn-sm">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Service</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Network Solutions"
                  value={title}
                  onChange={handleTitleChange}
                  className="input-base text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cisco-network-solutions"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-base text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-base text-sm"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Badge / Pill (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Engineers, Core Infrastructure"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Crisp 1-2 sentence description for service cards and search snippets..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="input-base text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Full Scope / Technical Overview (Markdown supported)
              </label>
              <textarea
                rows={6}
                placeholder="Comprehensive technical overview for the individual /services/[slug] landing page..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="input-base text-sm font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Capabilities */}
        {activeTab === 'capabilities' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Key Engineering Capabilities</h3>
                <p className="text-xs text-slate-500">
                  These items are displayed as feature checkmarks on service cards and detailed scope lists.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCapability}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Capability</span>
              </button>
            </div>

            <div className="space-y-3">
              {capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. VLAN architecture & 802.1Q trunking"
                    value={cap}
                    onChange={(e) => handleCapabilityChange(idx, e.target.value)}
                    className="input-base text-sm flex-1"
                  />
                  {capabilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Media & Branding */}
        {activeTab === 'media' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Banner Image Path / URL</label>
                <input
                  type="text"
                  placeholder="/net2.jpg or https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-base text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Image Alt Text</label>
                <input
                  type="text"
                  placeholder="e.g. Cisco Switch Configuration and Rack Deployment"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="input-base text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Category Icon</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
                {ICON_OPTIONS.map(({ name, Icon: OptionIcon }) => {
                  const selected = iconName === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setIconName(name)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selected
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xs ring-2 ring-blue-600/30'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <OptionIcon className="w-5 h-5" />
                      <span className="text-[10px] font-medium truncate w-full text-center">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CTA & WhatsApp */}
        {activeTab === 'cta' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Card Button Label</label>
              <input
                type="text"
                placeholder="e.g. Contact an Engineer, Configure My Network"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="input-base text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Prefilled WhatsApp Message Template (+92 322 4180930)
              </label>
              <textarea
                rows={3}
                placeholder="Hello ABS Network, I am interested in..."
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="input-base text-sm leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                This message will be automatically URI-encoded and injected into the direct WhatsApp link.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Publishing & SEO */}
        {activeTab === 'publishing' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <label htmlFor="isPublished" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Published (Live on site)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Featured on Homepage
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Sort / Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="input-base text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">SEO &amp; Search Engine Metadata</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Custom SEO Title</label>
                <input
                  type="text"
                  placeholder="Defaults to: [Service Title] | ABS Network"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="input-base text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Defaults to short description..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="input-base text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link href="/admin/services" className="btn-ghost btn-sm">
            ← Back to Services
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-md flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Service</span>
          </button>
        </div>
      </form>
    </div>
  );
}
