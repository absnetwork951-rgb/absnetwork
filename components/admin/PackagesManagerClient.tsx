'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Check,
  Star,
  Layers,
} from 'lucide-react';
import { BroadbandPackage } from '@/lib/db/types';
import { isContactPricing, getPackagePriceText } from '@/lib/db/pricing';
import {
  savePackageAction,
  deletePackageAction,
  togglePackageActiveAction,
} from '@/lib/actions/admin-packages';

interface PackagesManagerClientProps {
  initialPackages: BroadbandPackage[];
}

export default function PackagesManagerClient({
  initialPackages,
}: PackagesManagerClientProps) {
  const [packages, setPackages] = useState<BroadbandPackage[]>(initialPackages);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<BroadbandPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'contact'>('fixed');
  const [priceField, setPriceField] = useState(0);

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setPriceType('fixed');
    setPriceField(3500);
    setFeaturesList([
      'Unlimited Monthly Data (No FUP)',
      '1:1 Symmetrical Upload & Download',
      'Dual-Band Gigabit Wi-Fi Router Included',
      'Sub-10ms Gaming Latency Route',
      '24/7 Priority NOC Support',
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: BroadbandPackage) => {
    setEditingPkg(pkg);
    setPriceType(isContactPricing(pkg) ? 'contact' : 'fixed');
    setPriceField(pkg.pricePkr || 0);
    setFeaturesList(pkg.features || []);
    setModalOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeaturesList([...featuresList, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);
    formData.set('features', featuresList.join('\n'));
    if (editingPkg) {
      formData.set('id', editingPkg.id);
    }

    try {
      const res = await savePackageAction(formData);
      if (res.success && res.package) {
        if (editingPkg) {
          setPackages(packages.map((p) => (p.id === res.package!.id ? res.package! : p)));
          setNotification({ type: 'success', message: 'Package updated successfully!' });
        } else {
          setPackages([...packages, res.package]);
          setNotification({ type: 'success', message: 'New package added successfully!' });
        }
        setModalOpen(false);
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to save package' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setLoading(true);

    try {
      const res = await deletePackageAction(id);
      if (res.success) {
        setPackages(packages.filter((p) => p.id !== id));
        setNotification({ type: 'success', message: `Package "${name}" deleted.` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete package' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await togglePackageActiveAction(id);
      if (res.success) {
        setPackages(
          packages.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
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
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Broadband Packages</h2>
          <p className="text-sm text-slate-500">Manage residential, gaming, and enterprise fiber tiers</p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add New Package
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

      {/* Packages Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4">Package</th>
                <th className="p-4">Speed</th>
                <th className="p-4">Price (PKR)</th>
                <th className="p-4">Category</th>
                <th className="p-4">Data Policy</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{pkg.name}</span>
                      {pkg.isPopular && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{pkg.shortDescription}</div>
                  </td>
                  <td className="p-4 font-mono text-blue-600 font-bold">
                    {pkg.speedMbps} Mbps
                  </td>
                  <td className="p-4 font-bold font-mono text-slate-900">
                    {isContactPricing(pkg) ? (
                      <span className="text-blue-700">{getPackagePriceText(pkg)}</span>
                    ) : (
                      <>
                        {getPackagePriceText(pkg)}
                        <span className="text-[10px] font-normal text-slate-400">/{pkg.billingPeriod.toLowerCase()}</span>
                      </>
                    )}
                  </td>
                  <td className="p-4 capitalize text-slate-700 font-medium">
                    {pkg.category}
                  </td>
                  <td className="p-4 text-slate-500 font-mono">
                    {pkg.dataLimit}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(pkg.id)}
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border transition-colors ${
                        pkg.isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {pkg.isActive ? 'Active Live' : 'Hidden / Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors rounded-lg"
                        title="Edit Package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg"
                        title="Delete Package"
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
                {editingPkg ? 'Edit Broadband Package' : 'Create New Broadband Package'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Package Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingPkg?.name || ''}
                    placeholder="e.g. ABS Ultra Gamer 75"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    name="category"
                    defaultValue={editingPkg?.category || 'residential'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none"
                  >
                    <option value="residential">Residential Home</option>
                    <option value="gaming">Pro Gaming</option>
                    <option value="business">Business DIA</option>
                    <option value="enterprise">Enterprise Apex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Download Speed (Mbps) *</label>
                  <input
                    name="speedMbps"
                    type="number"
                    required
                    min="1"
                    defaultValue={editingPkg?.speedMbps || 40}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Upload Speed (Mbps)</label>
                  <input
                    name="uploadSpeedMbps"
                    type="number"
                    min="1"
                    defaultValue={editingPkg?.uploadSpeedMbps || 40}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Pricing Type *</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceType('fixed')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        priceType === 'fixed'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      Fixed Price (PKR + TAX)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceType('contact')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        priceType === 'contact'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      Contact for Rates
                    </button>
                  </div>
                  <input type="hidden" name="priceType" value={priceType} />
                  {priceType === 'contact' && (
                    <input type="hidden" name="pricePkr" value="0" />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Monthly Price (PKR) *</label>
                  <input
                    name="pricePkr"
                    type="number"
                    required
                    min="0"
                    disabled={priceType === 'contact'}
                    value={priceType === 'contact' ? 0 : priceField}
                    onChange={(e) => setPriceField(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono disabled:opacity-50"
                  />
                  {priceType === 'contact' && (
                    <p className="text-[11px] text-blue-700">This package shows &quot;Please contact us for rates.&quot; on the public site.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Installation Fee (PKR)</label>
                  <input
                    name="installationFeePkr"
                    type="number"
                    min="0"
                    defaultValue={editingPkg?.installationFeePkr || 2500}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Short Description</label>
                  <input
                    name="shortDescription"
                    type="text"
                    defaultValue={editingPkg?.shortDescription || ''}
                    placeholder="e.g. Ultra-fast optical fiber plan for competitive gaming & multiple 4K streams."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Router / Hardware Included</label>
                  <input
                    name="routerDetails"
                    type="text"
                    defaultValue={editingPkg?.routerDetails || 'Dual-Band Gigabit Wi-Fi Optical Router (ONT)'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Features List Manager */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Package Features Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add feature item..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="btn-secondary btn-sm shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuresList.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-[11px] text-slate-800 rounded-full"
                      >
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(i)}
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
                      name="isPopular"
                      type="checkbox"
                      defaultChecked={editingPkg?.isPopular || false}
                      className="border-slate-300 text-blue-600 w-4 h-4 rounded"
                    />
                    <span>Highlight as &apos;Popular Choice&apos;</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingPkg ? editingPkg.isActive : true}
                      className="border-slate-300 text-blue-600 w-4 h-4 rounded"
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
                  {editingPkg ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
