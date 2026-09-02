'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Star,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  EyeOff,
  Pencil,
  StarOff,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Layers,
  Network,
  Globe,
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
  type LucideIcon,
} from 'lucide-react';
import type { ServiceItem, AdminRole } from '@/lib/db/types';
import { SERVICE_CATEGORIES } from '@/lib/db/service-categories';
import {
  saveServiceAction,
  deleteServiceAction,
  toggleServicePublishedAction,
  toggleServiceFeaturedAction,
  reorderServiceAction,
} from '@/lib/actions/admin-services';

interface ServicesManagerClientProps {
  initialServices: ServiceItem[];
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

function iconByName(name?: string): LucideIcon {
  return ICON_OPTIONS.find((i) => i.name === name)?.Icon || Network;
}

const statusMeta = {
  published: { label: 'Published', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  draft: { label: 'Draft', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: EyeOff },
};

export default function ServicesManagerClient({
  initialServices,
  actorRole,
}: ServicesManagerClientProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<ServiceItem | null>(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const sorted = [...services].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleOpenCreate = () => {
    setEditing(null);
    setFieldError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditing(svc);
    setFieldError(null);
    setModalOpen(true);
  };

  const handleTogglePublish = async (svc: ServiceItem) => {
    setTogglingId(svc.id);
    try {
      const res = await toggleServicePublishedAction(svc.id);
      if (res.success && res.service) {
        setServices(services.map((s) => (s.id === res.service!.id ? res.service! : s)));
        setNotification({ type: 'success', message: res.service.isPublished ? 'Service published.' : 'Service moved to drafts.' });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to update' });
      }
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (svc: ServiceItem) => {
    setTogglingId(svc.id);
    try {
      const res = await toggleServiceFeaturedAction(svc.id);
      if (res.success && res.service) {
        setServices(services.map((s) => (s.id === res.service!.id ? res.service! : s)));
        setNotification({ type: 'success', message: res.service.isFeatured ? 'Service featured.' : 'Service unfeatured.' });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to update' });
      }
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleReorder = async (svc: ServiceItem, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === svc.id);
    const neighbor = sorted[idx + dir];
    if (!neighbor) return;
    setServices(
      services.map((s) => {
        if (s.id === svc.id) return { ...s, displayOrder: neighbor.displayOrder };
        if (s.id === neighbor.id) return { ...s, displayOrder: svc.displayOrder };
        return s;
      })
    );
    setTogglingId(svc.id);
    try {
      await reorderServiceAction(svc.id, neighbor.displayOrder);
      await reorderServiceAction(neighbor.id, svc.displayOrder);
      setNotification({ type: 'success', message: 'Order updated.' });
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error reordering' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await deleteServiceAction(pendingDelete.id);
      if (res.success) {
        setServices(services.filter((s) => s.id !== pendingDelete.id));
        setNotification({ type: 'success', message: `"${pendingDelete.title}" removed.` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete' });
      }
      setPendingDelete(null);
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const publishedCount = services.filter((s) => s.isPublished).length;
  const featuredCount = services.filter((s) => s.isFeatured).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Services CMS</h2>
          <p className="text-sm text-slate-500">Manage the service catalog shown across the public website, homepage, and sitemap.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl font-extrabold text-slate-900">{services.length}</div>
          <div className="text-[11px] font-semibold text-slate-500">Total Services</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl font-extrabold text-emerald-600">{publishedCount}</div>
          <div className="text-[11px] font-semibold text-slate-500">Published</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-2xl font-extrabold text-blue-600">{featuredCount}</div>
          <div className="text-[11px] font-semibold text-slate-500">Featured</div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 text-xs flex items-center gap-2 border rounded-xl ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors" title="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Service</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Category</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Status</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Featured</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Order</th>
                <th className="p-4 text-right text-[11px] font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((svc, idx) => {
                const Icon = iconByName(svc.iconName);
                const Meta = svc.isPublished ? statusMeta.published : statusMeta.draft;
                const cat = SERVICE_CATEGORIES.find((c) => c.slug === svc.category);
                const isBusy = togglingId === svc.id;
                return (
                  <tr key={svc.id} className={`hover:bg-slate-50 transition-colors ${svc.isPublished ? '' : 'opacity-70'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{svc.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">/{svc.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge bg-slate-100 text-slate-700 border border-slate-200">{cat?.label || svc.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${Meta.cls}`}>
                        <Meta.icon className="w-3 h-3" />
                        {Meta.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {svc.isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-500">{idx + 1}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={() => handleReorder(svc, -1)}
                            disabled={idx === 0 || isBusy}
                            className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorder(svc, 1)}
                            disabled={idx === sorted.length - 1 || isBusy}
                            className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setPreviewOpen(svc)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-blue-400 transition-colors rounded-lg" title="Preview Service" aria-label="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(svc)}
                          disabled={isBusy}
                          className={`p-2 transition-colors rounded-lg border ${svc.isFeatured ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600'}`}
                          title={svc.isFeatured ? 'Unfeature' : 'Feature'}
                          aria-label={svc.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          {svc.isFeatured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={handleOpenEdit.bind(null, svc)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-blue-400 transition-colors rounded-lg" title="Edit Service" aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(svc)}
                          disabled={isBusy}
                          className={`p-2 transition-colors rounded-lg border ${svc.isPublished ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                          title={svc.isPublished ? 'Unpublish (move to draft)' : 'Publish'}
                          aria-label={svc.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : svc.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setPendingDelete(svc)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg" title="Delete Service" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12">
                    <div className="mx-auto max-w-sm text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                        <Layers className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No services yet</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Service&quot; to create your first catalog entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{services.length}</span> services · Published services appear automatically on the public site and sitemap.
      </p>

      {modalOpen && (
        <ServiceEditorModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={(saved, isNew) => {
            if (isNew) setServices([...services, saved]);
            else setServices(services.map((s) => (s.id === saved.id ? saved : s)));
            setModalOpen(false);
            setNotification({ type: 'success', message: isNew ? 'Service created.' : 'Service updated.' });
          }}
          onError={(msg) => setFieldError(msg)}
          fieldError={fieldError}
          setFieldError={setFieldError}
        />
      )}

      {previewOpen && (
        <ServicePreview
          service={previewOpen}
          onClose={() => setPreviewOpen(null)}
          actorRole={actorRole}
        />
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete service?</h3>
                <p className="text-xs text-slate-500">
                  &quot;{pendingDelete.title}&quot; will be removed from the public site and sitemap. {pendingDelete.isPublished ? 'It will be archived (soft delete) to preserve its URL history.' : ''}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button onClick={() => setPendingDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={deleting} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicePreview({
  service,
  onClose,
  actorRole,
}: {
  service: ServiceItem;
  onClose: () => void;
  actorRole: AdminRole;
}) {
  const Icon = iconByName(service.iconName);
  const cat = SERVICE_CATEGORIES.find((c) => c.slug === service.category);
  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Service Preview</h3>
            <span className="badge bg-slate-100 text-slate-600 border border-slate-200">{service.isPublished ? 'Published' : 'Draft'}</span>
          </div>
          <div className="flex items-center gap-2">
            {service.isPublished && (
              <Link href={`/services/${service.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                View live <ExternalLink className="w-3 h-3" />
              </Link>
            )}
            <button onClick={onClose} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto">
          {/* Hero */}
          <div className="relative h-56 w-full bg-slate-900">
            {service.imageUrl ? (
              <Image src={service.imageUrl} alt={service.imageAlt || service.title} fill sizes="100vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
                <Icon className="w-16 h-16 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="badge bg-white/95 text-slate-800">{cat?.label || service.category}</span>
                {service.badge && <span className="badge bg-blue-600/90 text-white">{service.badge}</span>}
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-2">{service.title}</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-slate-700 leading-relaxed">{service.fullDescription}</p>

            {service.capabilities && service.capabilities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {service.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{cap}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center"
              >
                {service.ctaLabel || 'Contact Us'}
              </a>
              <Link href={service.isPublished ? `/services/${service.slug}` : `/services`} className="btn-secondary flex-1 text-center">
                {service.isPublished ? 'View live detail page' : 'Detail page (publish to go live)'}
              </Link>
            </div>

            {/* SEO summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SEO Preview</div>
              <div className="text-sm font-bold text-blue-700">{service.seoTitle || `${service.title} | ABS Network`}</div>
              <div className="text-xs text-slate-600">{service.seoDescription || service.shortDescription}</div>
              <div className="text-[11px] text-emerald-600 break-all">https://www.absnetwork.com.pk/services/{service.slug}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ServiceEditorModalProps {
  editing: ServiceItem | null;
  onClose: () => void;
  onSaved: (saved: ServiceItem, isNew: boolean) => void;
  onError: (msg: string | null) => void;
  fieldError: string | null;
  setFieldError: (msg: string | null) => void;
}

const emptyForm = {
  title: '',
  slug: '',
  category: 'networking',
  shortDescription: '',
  fullDescription: '',
  iconName: 'Network',
  badge: '',
  capabilities: [] as string[],
  imageUrl: '',
  imageAlt: '',
  ctaLabel: '',
  whatsappMessage: '',
  isFeatured: false,
  isPublished: true,
  displayOrder: 1,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [] as string[],
  canonicalUrl: '',
  socialImage: '',
  robotsIndex: true,
  robotsFollow: true,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ServiceEditorModal({ editing, onClose, onSaved, onError, fieldError, setFieldError }: ServiceEditorModalProps) {
  const [form, setForm] = useState(() =>
    editing
      ? {
          title: editing.title,
          slug: editing.slug,
          category: editing.category as string,
          shortDescription: editing.shortDescription,
          fullDescription: editing.fullDescription,
          iconName: editing.iconName || 'Network',
          badge: editing.badge || '',
          capabilities: editing.capabilities || editing.features || [],
          imageUrl: editing.imageUrl || '',
          imageAlt: editing.imageAlt || '',
          ctaLabel: editing.ctaLabel || '',
          whatsappMessage: editing.whatsappMessage || '',
          isFeatured: editing.isFeatured,
          isPublished: editing.isPublished !== false,
          displayOrder: editing.displayOrder,
          seoTitle: editing.seoTitle || '',
          seoDescription: editing.seoDescription || '',
          seoKeywords: editing.seoKeywords || [],
          canonicalUrl: editing.canonicalUrl || '',
          socialImage: editing.socialImage || '',
          robotsIndex: editing.robotsIndex !== false,
          robotsFollow: editing.robotsFollow !== false,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [newCap, setNewCap] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleTitleChange = (v: string) => {
    set({ title: v });
    if (!editing || !form.slug || form.slug === slugify(form.title)) {
      set({ slug: slugify(v) });
    }
  };

  const addCapability = () => {
    if (newCap.trim()) {
      set({ capabilities: [...form.capabilities, newCap.trim()] });
      setNewCap('');
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      set({ seoKeywords: [...form.seoKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError(null);
    setSaving(true);

    const fd = new FormData();
    if (editing) fd.set('id', editing.id);
    fd.set('title', form.title);
    fd.set('slug', form.slug);
    fd.set('category', form.category);
    fd.set('shortDescription', form.shortDescription);
    fd.set('fullDescription', form.fullDescription);
    fd.set('iconName', form.iconName);
    fd.set('badge', form.badge);
    fd.set('capabilities', form.capabilities.join('\n'));
    fd.set('imageUrl', form.imageUrl);
    fd.set('imageAlt', form.imageAlt);
    fd.set('ctaLabel', form.ctaLabel);
    fd.set('whatsappMessage', form.whatsappMessage);
    fd.set('isFeatured', String(form.isFeatured));
    fd.set('isPublished', String(form.isPublished));
    fd.set('displayOrder', String(form.displayOrder));
    fd.set('seoTitle', form.seoTitle);
    fd.set('seoDescription', form.seoDescription);
    fd.set('seoKeywords', form.seoKeywords.join('\n'));
    fd.set('canonicalUrl', form.canonicalUrl);
    fd.set('socialImage', form.socialImage);
    fd.set('robotsIndex', String(form.robotsIndex));
    fd.set('robotsFollow', String(form.robotsFollow));

    try {
      const res = await saveServiceAction(fd);
      if (res.success && res.service) {
        onSaved(res.service, !editing);
      } else {
        setFieldError(res.error || 'Failed to save service');
      }
    } catch (err: unknown) {
      setFieldError(err instanceof Error ? err.message : 'Error saving service');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all';
  const labelCls = 'text-xs font-semibold text-slate-700';

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl my-8 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <h3 className="text-base font-bold text-slate-900">
            {editing ? 'Edit Service' : 'Add Service'}
          </h3>
          <button onClick={onClose} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Basic Information */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-title" className={labelCls}>Service Name *</label>
                <input id="svc-title" className={inputCls} value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Cisco Network Solutions" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-slug" className={labelCls}>Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">/services/</span>
                  <input id="svc-slug" className={inputCls} value={form.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} placeholder="cisco-network-solutions" required />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-category" className={labelCls}>Category *</label>
                <select id="svc-category" className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-badge" className={labelCls}>Badge (optional)</label>
                <input id="svc-badge" className={inputCls} value={form.badge} onChange={(e) => set({ badge: e.target.value })} placeholder="e.g. Certified Engineers" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="svc-short" className={labelCls}>Short Description *</label>
              <textarea id="svc-short" className={`${inputCls} resize-none`} rows={2} value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} placeholder="One-sentence summary shown on cards and used as SEO fallback" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="svc-full" className={labelCls}>Full Description *</label>
              <textarea id="svc-full" className={`${inputCls} resize-none`} rows={4} value={form.fullDescription} onChange={(e) => set({ fullDescription: e.target.value })} placeholder="Detailed description shown on the service detail page" required />
            </div>
          </section>

          {/* Capabilities */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> Capabilities
            </h4>
            <div className="space-y-2">
              {form.capabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    className={inputCls}
                    value={cap}
                    onChange={(e) => set({ capabilities: form.capabilities.map((c, ci) => (ci === i ? e.target.value : c)) })}
                  />
                  <button
                    type="button"
                    onClick={() => set({ capabilities: form.capabilities.filter((_, ci) => ci !== i) })}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                    aria-label="Remove capability"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className={inputCls}
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCapability(); } }}
                placeholder="Add a capability and press Enter"
              />
              <button type="button" onClick={addCapability} className="btn-secondary btn-sm shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </section>

          {/* Visual */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> Visual
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-image" className={labelCls}>Image URL</label>
                <input id="svc-image" className={inputCls} value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://... or /image.jpg" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-alt" className={labelCls}>Alt Text</label>
                <input id="svc-alt" className={inputCls} value={form.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} placeholder="Describe the image for accessibility/SEO" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => set({ iconName: name })}
                    className={`p-2 rounded-lg border transition-colors ${form.iconName === name ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400'}`}
                    title={name}
                    aria-label={name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            {form.imageUrl && (
              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200">
                <Image src={form.imageUrl} alt={form.imageAlt || 'Image preview'} fill sizes="300px" className="object-cover" />
              </div>
            )}
          </section>

          {/* CTA & WhatsApp */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> Call-to-Action & WhatsApp
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-cta" className={labelCls}>CTA Label</label>
                <input id="svc-cta" className={inputCls} value={form.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} placeholder="e.g. Contact an Engineer" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-wa" className={labelCls}>WhatsApp Message</label>
                <input id="svc-wa" className={inputCls} value={form.whatsappMessage} onChange={(e) => set({ whatsappMessage: e.target.value })} placeholder="Prefilled message for the WhatsApp CTA" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">WhatsApp CTA uses +92 322 4180930 and the message above (URL-encoded automatically).</p>
          </section>

          {/* Publishing */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> Publishing & Ordering
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={form.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Published</div>
                  <div className="text-slate-400 text-[10px]">Visible to the public + sitemap</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Featured</div>
                  <div className="text-slate-400 text-[10px]">Shown on the homepage</div>
                </div>
              </label>
              <div className="space-y-1.5">
                <label htmlFor="svc-order" className={labelCls}>Display Order</label>
                <input id="svc-order" type="number" className={inputCls} value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) || 0 })} />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" /> SEO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-seo-title" className={labelCls}>SEO Title (optional)</label>
                <input id="svc-seo-title" className={inputCls} value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} placeholder="Defaults to: {Title} | ABS Network" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-seo-desc" className={labelCls}>Meta Description (optional)</label>
                <input id="svc-seo-desc" className={inputCls} value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} placeholder="Defaults to the short description" />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>SEO Keywords</label>
              <div className="flex flex-wrap gap-1.5">
                {form.seoKeywords.map((k, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold rounded-lg px-2 py-1">
                    {k}
                    <button type="button" onClick={() => set({ seoKeywords: form.seoKeywords.filter((_, ki) => ki !== i) })} aria-label="Remove keyword"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                  placeholder="Add SEO keyword and press Enter"
                />
                <button type="button" onClick={addKeyword} className="btn-secondary btn-sm shrink-0"><Plus className="w-3.5 h-3.5" /> Add</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-canonical" className={labelCls}>Canonical URL (optional)</label>
                <input id="svc-canonical" className={inputCls} value={form.canonicalUrl} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder="Auto-generated from slug by default" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="svc-social" className={labelCls}>Social Image URL (optional)</label>
                <input id="svc-social" className={inputCls} value={form.socialImage} onChange={(e) => set({ socialImage: e.target.value })} placeholder="Falls back to the service image" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={form.robotsIndex} onChange={(e) => set({ robotsIndex: e.target.checked })} />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">allow indexing</div>
                  <div className="text-slate-400 text-[10px]">index, follow recommended</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={form.robotsFollow} onChange={(e) => set({ robotsFollow: e.target.checked })} />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">allow following links</div>
                  <div className="text-slate-400 text-[10px]">follow recommended</div>
                </div>
              </label>
            </div>
          </section>

          {fieldError && (
            <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {fieldError}
            </p>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
