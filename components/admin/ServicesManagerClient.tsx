'use client';

import React, { useState, useEffect, createElement } from 'react';
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
}: ServicesManagerClientProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
        <Link href="/admin/services/new" className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </Link>
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
                          {createElement(Icon, { className: 'w-4.5 h-4.5', style: { width: 18, height: 18 } })}
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
                      <button
                        onClick={() => handleToggleFeatured(svc)}
                        disabled={isBusy}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors disabled:opacity-50 ${svc.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600'}`}
                        title={svc.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {svc.isFeatured ? <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> : <StarOff className="w-3 h-3" />}
                        {svc.isFeatured ? 'Featured' : 'Feature'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(svc, -1)}
                          disabled={idx === 0 || isBusy}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] font-mono text-slate-400 w-6 text-center">{idx + 1}</span>
                        <button
                          onClick={() => handleReorder(svc, 1)}
                          disabled={idx === sorted.length - 1 || isBusy}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewOpen(svc)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(svc)}
                          disabled={isBusy}
                          className={`p-2 rounded-lg border transition-colors disabled:opacity-50 ${svc.isPublished ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                          title={svc.isPublished ? 'Unpublish (move to drafts)' : 'Publish'}
                        >
                          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : svc.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <Link
                          href={`/admin/services/${svc.id}`}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          title="Edit full details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setPendingDelete(svc)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-slate-600">No services yet</div>
                    <div className="text-xs text-slate-400 mt-1">Create your first service to publish it to the public site.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-only preview modal */}
      {previewOpen && (
        <ServicePreview service={previewOpen} onClose={() => setPreviewOpen(null)} />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete service</h3>
                <p className="text-xs text-slate-500">This action is permanent.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">{pendingDelete.title}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="btn-sm inline-flex items-center gap-2 bg-rose-600 disabled:opacity-60 text-white font-bold rounded-xl px-4 py-2.5 hover:bg-rose-700 transition-colors"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
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
}: {
  service: ServiceItem;
  onClose: () => void;
}) {
  const Icon = iconByName(service.iconName);
  const cat = SERVICE_CATEGORIES.find((c) => c.slug === service.category);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          {service.imageUrl ? (
            <Image src={service.imageUrl} alt={service.imageAlt || service.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 42rem" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
              {createElement(Icon, { className: 'w-12 h-12 text-white/20' })}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="badge bg-white/95 text-slate-800">{cat?.label || service.category}</span>
            {service.isFeatured && <span className="badge bg-amber-400/90 text-slate-900 ml-2">Featured</span>}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
            <p className="text-xs text-slate-500 mt-1">/{service.slug}</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{service.shortDescription}</p>
          {(service.capabilities?.length || service.features?.length) && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Capabilities</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(service.capabilities?.length ? service.capabilities : service.features!).map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <a href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
              View Live
            </a>
            <Link href={`/admin/services/${service.id}`} className="btn-primary btn-sm">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
