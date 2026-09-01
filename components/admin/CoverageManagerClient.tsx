'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import type { CoverageArea } from '@/lib/db/types';
import {
  saveCoverageAreaAction,
  deleteCoverageAreaAction,
} from '@/lib/actions/admin-coverage';

interface CoverageManagerClientProps {
  initialAreas: CoverageArea[];
}

export default function CoverageManagerClient({
  initialAreas,
}: CoverageManagerClientProps) {
  const [areas, setAreas] = useState<CoverageArea[]>(initialAreas);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<CoverageArea | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CoverageArea | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleOpenCreate = () => {
    setEditingArea(null);
    setFieldError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (area: CoverageArea) => {
    setEditingArea(area);
    setFieldError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError(null);
    setNotification(null);

    const formData = new FormData(e.currentTarget);
    const city = String(formData.get('city') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();

    if (!city) {
      setFieldError('City is required.');
      return;
    }
    if (!name) {
      setFieldError('Area name is required.');
      return;
    }

    const duplicate = areas.some(
      (a) => a.name.toLowerCase() === name.toLowerCase() && a.city.toLowerCase() === city.toLowerCase() && a.id !== editingArea?.id
    );
    if (duplicate) {
      setFieldError('An area with this name already exists in this city.');
      return;
    }

    if (editingArea) {
      formData.set('id', editingArea.id);
    }

    setLoading(true);
    try {
      const res = await saveCoverageAreaAction(formData);
      if (res.success && res.area) {
        if (editingArea) {
          setAreas(areas.map((a) => (a.id === res.area!.id ? res.area! : a)));
          setNotification({ type: 'success', message: 'Coverage area updated!' });
        } else {
          setAreas([...areas, res.area]);
          setNotification({ type: 'success', message: 'Coverage area added!' });
        }
        setModalOpen(false);
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to save coverage area' });
      }
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await deleteCoverageAreaAction(pendingDelete.id);
      if (res.success) {
        setAreas(areas.filter((a) => a.id !== pendingDelete.id));
        setNotification({ type: 'success', message: `Coverage area "${pendingDelete.name}" deleted.` });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Coverage Areas</h2>
          <p className="text-sm text-slate-500">Manage the areas shown in the public availability checker</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add Coverage Area
        </button>
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
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">Area</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-wider">City</th>
                <th className="p-4 text-right text-[11px] font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-slate-900">{area.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 font-medium capitalize">{area.city}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(area)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors rounded-lg" title="Edit Coverage Area">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setPendingDelete(area)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg" title="Delete Coverage Area">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12">
                    <div className="mx-auto max-w-sm text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No coverage areas yet</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Coverage Area&quot; to list your first service area.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{areas.length}</span> coverage area{areas.length === 1 ? '' : 's'}
      </p>

      {pendingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete coverage area?</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete this coverage area? &quot;{pendingDelete.name}&quot; will no longer appear in the public availability checker.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button onClick={() => setPendingDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={deleting} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? 'Deleting...' : 'Delete Area'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingArea ? 'Edit Coverage Area' : 'Add Coverage Area'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="coverage-area-name" className="text-xs font-semibold text-slate-700">Area Name *</label>
                  <input id="coverage-area-name" name="name" type="text" defaultValue={editingArea?.name || ''} placeholder="e.g. Mall Road" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="coverage-area-city" className="text-xs font-semibold text-slate-700">City *</label>
                  <input id="coverage-area-city" name="city" type="text" defaultValue={editingArea?.city || 'Lahore'} placeholder="Lahore" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none" />
                </div>
              </div>

              {fieldError && (
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {fieldError}
                </p>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingArea ? 'Update Area' : 'Save Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}