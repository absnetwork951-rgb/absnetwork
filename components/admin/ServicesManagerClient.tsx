'use client';

import React, { useState } from 'react';
import {
  Server,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import { ServiceItem } from '@/lib/db/types';
import {
  saveServiceAction,
  deleteServiceAction,
  toggleServiceActiveAction,
} from '@/lib/actions/admin-services';

interface ServicesManagerClientProps {
  initialServices: ServiceItem[];
}

export default function ServicesManagerClient({
  initialServices,
}: ServicesManagerClientProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Capabilities list
  const [capabilitiesList, setCapabilitiesList] = useState<string[]>([]);
  const [newCap, setNewCap] = useState('');

  const handleOpenCreate = () => {
    setEditingService(null);
    setCapabilitiesList([
      'Dedicated SLA contract guarantee',
      '24/7 Optical Engineering Support',
      'Turnkey hardware deployment',
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setCapabilitiesList(srv.capabilities || []);
    setModalOpen(true);
  };

  const handleAddCap = () => {
    if (newCap.trim()) {
      setCapabilitiesList([...capabilitiesList, newCap.trim()]);
      setNewCap('');
    }
  };

  const handleRemoveCap = (idx: number) => {
    setCapabilitiesList(capabilitiesList.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);
    formData.set('capabilities', JSON.stringify(capabilitiesList));
    if (editingService) {
      formData.set('id', editingService.id);
    }

    try {
      const res = await saveServiceAction(formData);
      if (res.success && res.service) {
        if (editingService) {
          setServices(services.map((s) => (s.id === res.service!.id ? res.service! : s)));
          setNotification({ type: 'success', message: 'Service updated successfully!' });
        } else {
          setServices([...services, res.service]);
          setNotification({ type: 'success', message: 'New service created successfully!' });
        }
        setModalOpen(false);
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to save service' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setLoading(true);

    try {
      const res = await deleteServiceAction(id);
      if (res.success) {
        setServices(services.filter((s) => s.id !== id));
        setNotification({ type: 'success', message: `Service "${title}" removed.` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete service' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await toggleServiceActiveAction(id);
      if (res.success) {
        setServices(
          services.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Telecom &amp; IT Services</h2>
          <p className="text-sm text-slate-500">Configure corporate leased lines, network solutions, and digital IT services</p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add New Service
        </button>
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

      {/* Services Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4">Service</th>
                <th className="p-4">Badge / Category</th>
                <th className="p-4">Icon Key</th>
                <th className="p-4">Capabilities Count</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{srv.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{srv.shortDescription}</div>
                  </td>
                  <td className="p-4">
                    {srv.badge ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        {srv.badge}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-blue-600">{srv.iconName}</td>
                  <td className="p-4 text-slate-600 font-mono">{(srv.capabilities || srv.features || []).length} items</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(srv.id)}
                      className={`px-2.5 py-0.5 text-[10px] font-semibold border transition-colors rounded-full ${
                        srv.isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {srv.isActive ? 'Active Live' : 'Hidden / Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors rounded-lg"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(srv.id, srv.title)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingService ? 'Edit Telecom & IT Service' : 'Create New Telecom & IT Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Service Title *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingService?.title || ''}
                    placeholder="e.g. Dedicated Internet Access (DIA)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Icon Identifier</label>
                  <select
                    name="iconName"
                    defaultValue={editingService?.iconName || 'Server'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl font-mono"
                  >
                    <option value="Server">Server (DIA / Leased)</option>
                    <option value="Wifi">Wifi (Broadband)</option>
                    <option value="ShieldCheck">ShieldCheck (Security / DDoS)</option>
                    <option value="Router">Router (Equipment Sales)</option>
                    <option value="Globe">Globe (Web &amp; Digital)</option>
                    <option value="Headphones">Headphones (24/7 NOC)</option>
                    <option value="Cpu">Cpu (IT Hardware)</option>
                    <option value="Zap">Zap (High-Speed)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category Tag</label>
                  <input
                    name="category"
                    type="text"
                    defaultValue={editingService?.category || 'corporate'}
                    placeholder="e.g. connectivity, digital, networking, infrastructure"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Badge Label (Optional)</label>
                  <input
                    name="badge"
                    type="text"
                    defaultValue={editingService?.badge || ''}
                    placeholder="e.g. 99.99% SLA, Carrier-Grade"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Short Description *</label>
                  <textarea
                    name="shortDescription"
                    rows={2}
                    required
                    defaultValue={editingService?.shortDescription || ''}
                    placeholder="Concise overview of what this service provides..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none resize-none rounded-xl"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Full In-Depth Description</label>
                  <textarea
                    name="fullDescription"
                    rows={3}
                    defaultValue={editingService?.fullDescription || ''}
                    placeholder="Detailed technical overview and enterprise SLA metrics..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none resize-none rounded-xl"
                  />
                </div>

                {/* Capabilities List Manager */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Service Capabilities / Features</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCap}
                      onChange={(e) => setNewCap(e.target.value)}
                      placeholder="Add capability item..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddCap}
                      className="btn-secondary btn-sm shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {capabilitiesList.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-[11px] text-slate-800 rounded-lg"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCap(i)}
                          className="text-slate-500 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingService ? editingService.isActive : true}
                      className="border-slate-300 text-blue-600 w-4 h-4 rounded-md"
                    />
                    <span>Active on Public Website</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
