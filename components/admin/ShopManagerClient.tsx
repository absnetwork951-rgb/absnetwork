'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Star,
  Network,
} from 'lucide-react';
import { ShopProduct } from '@/lib/db/types';
import {
  saveShopProductAction,
  deleteShopProductAction,
  toggleShopProductActiveAction,
} from '@/lib/actions/admin-shop';

interface ShopManagerClientProps {
  initialProducts: ShopProduct[];
}

export default function ShopManagerClient({
  initialProducts,
}: ShopManagerClientProps) {
  const [products, setProducts] = useState<ShopProduct[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [specKeys, setSpecKeys] = useState<{ key: string; val: string }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [newImgUrl, setNewImgUrl] = useState('');

  const handleOpenCreate = () => {
    setEditingProd(null);
    setSpecKeys([]);
    setImagesList([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: ShopProduct) => {
    setEditingProd(prod);
    const specs = Object.entries(prod.specifications || {}).map(([key, val]) => ({ key, val: String(val) }));
    setSpecKeys(specs);
    setImagesList(prod.images || []);
    setModalOpen(true);
  };

  const handleAddSpec = () => {
    if (newKey.trim() && newVal.trim()) {
      setSpecKeys([...specKeys, { key: newKey.trim(), val: newVal.trim() }]);
      setNewKey('');
      setNewVal('');
    }
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecKeys(specKeys.filter((_, i) => i !== idx));
  };

  const handleAddImage = () => {
    if (newImgUrl.trim()) {
      setImagesList([...imagesList, newImgUrl.trim()]);
      setNewImgUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImagesList(imagesList.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);
    const specObj: Record<string, string> = {};
    specKeys.forEach((item) => {
      specObj[item.key] = item.val;
    });

    formData.set('specifications', JSON.stringify(specObj));
    formData.set('images', JSON.stringify(imagesList));
    if (editingProd) {
      formData.set('id', editingProd.id);
    }

    try {
      const res = await saveShopProductAction(formData);
      if (res.success && res.product) {
        if (editingProd) {
          setProducts(products.map((p) => (p.id === res.product!.id ? res.product! : p)));
          setNotification({ type: 'success', message: 'Product updated successfully!' });
        } else {
          setProducts([...products, res.product]);
          setNotification({ type: 'success', message: 'New product added!' });
        }
        setModalOpen(false);
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to save product' });
      }
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setLoading(true);
    try {
      const res = await deleteShopProductAction(id);
      if (res.success) {
        setProducts(products.filter((p) => p.id !== id));
        setNotification({ type: 'success', message: `Product "${name}" deleted.` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete' });
      }
    } catch (err: unknown) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await toggleShopProductActiveAction(id);
      if (res.success) {
        setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-slate-900">
            <span className="font-bold">Shop Products</span> Catalog
          </h2>
          <p className="text-xs text-slate-500">Manage fiber optic cables, routers, switches, and networking equipment</p>
        </div>
        <button onClick={handleOpenCreate} className="px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center gap-1.5 shadow-sm transition-colors rounded-xl">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 text-xs flex items-center gap-2 border rounded-xl ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-mono font-bold text-[10px] bg-slate-50/70">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand / Model</th>
                <th className="p-4">Price (PKR)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {prod.images && prod.images[0] ? (
                          <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" referrerPolicy="no-referrer" sizes="40px" />
                        ) : <Network className="w-4 h-4 text-slate-300 m-auto mt-3" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{prod.name}</span>
                          {prod.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{prod.shortDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-slate-700 font-medium">{prod.category.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-slate-700">
                    <div className="font-semibold text-slate-900">{prod.brand}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{prod.model}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold font-mono text-slate-900">PKR {(prod.salePricePkr || prod.pricePkr).toLocaleString()}</div>
                    {prod.salePricePkr && <div className="text-[10px] text-slate-400 line-through font-mono">PKR {prod.pricePkr.toLocaleString()}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${prod.stockStatus === 'in_stock' ? 'bg-blue-50 text-blue-700 border-blue-200' : prod.stockStatus === 'pre_order' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {prod.stockStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleToggleActive(prod.id)} className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border transition-colors ${prod.isActive ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                      {prod.isActive ? 'Active Live' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(prod)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors rounded-lg" title="Edit Product">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(prod.id, prod.name)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg" title="Delete Product">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-sm">
                    No products yet. Click &quot;Add Product&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingProd ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Product Name *</label>
                  <input name="name" type="text" required defaultValue={editingProd?.name || ''} placeholder="e.g. Single Mode Fiber Optic Patch Cable SC-UPC" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select name="category" defaultValue={editingProd?.category || 'fiber_optics'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none">
                    <option value="network_cables">Network Cables</option>
                    <option value="fiber_optics">Fiber Optics</option>
                    <option value="fiber_accessories">Fiber Accessories</option>
                    <option value="routers">Routers</option>
                    <option value="network_switches">Network Switches</option>
                    <option value="optical_devices">Optical Devices</option>
                    <option value="network_accessories">Network Accessories</option>
                    <option value="tools_testing">Tools &amp; Testing</option>
                    <option value="rack_cabinet">Rack &amp; Cabinet</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Brand *</label>
                  <input name="brand" type="text" required defaultValue={editingProd?.brand || ''} placeholder="e.g. TP-Link, MikroTik, Huawei" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Model *</label>
                  <input name="model" type="text" required defaultValue={editingProd?.model || ''} placeholder="e.g. TL-SF1005D" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">SKU</label>
                  <input name="sku" type="text" defaultValue={editingProd?.sku || ''} placeholder="Optional SKU" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Price (PKR) *</label>
                  <input name="pricePkr" type="number" required defaultValue={editingProd?.pricePkr || ''} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Sale Price (PKR)</label>
                  <input name="salePricePkr" type="number" defaultValue={editingProd?.salePricePkr || ''} placeholder="Optional discount" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Warranty (Years)</label>
                  <input name="warrantyYears" type="number" defaultValue={editingProd?.warrantyYears || 1} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Stock Status</label>
                  <select name="stockStatus" defaultValue={editingProd?.stockStatus || 'in_stock'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none">
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_order">On Order</option>
                    <option value="pre_order">Pre-Order</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Stock Qty</label>
                  <input name="stockQuantity" type="number" defaultValue={editingProd?.stockQuantity || 10} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none font-mono" />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Short Summary *</label>
                  <input name="shortDescription" type="text" required defaultValue={editingProd?.shortDescription || ''} placeholder="Brief product summary" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none" />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700">Full Description</label>
                  <textarea name="fullDescription" rows={3} defaultValue={editingProd?.fullDescription || ''} placeholder="Detailed product description..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:border-blue-600 focus:outline-none resize-none" />
                </div>

                <div className="space-y-2 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700">Technical Specifications</label>
                  <div className="flex gap-2">
                    <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Spec Key" className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl" />
                    <input type="text" value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="Value" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl" />
                    <button type="button" onClick={handleAddSpec} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase rounded-xl">Add</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {specKeys.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl">
                        <span className="font-semibold text-slate-700">{s.key}:</span>
                        <span className="text-slate-900 font-mono">{s.val}</span>
                        <button type="button" onClick={() => handleRemoveSpec(i)} className="text-slate-400 hover:text-rose-600 p-1"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700">Product Image URLs</label>
                  <div className="flex gap-2">
                    <input type="url" value={newImgUrl} onChange={(e) => setNewImgUrl(e.target.value)} placeholder="Image URL" className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl" />
                    <button type="button" onClick={handleAddImage} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {imagesList.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                        <Image src={img} alt="thumb" fill className="object-cover" referrerPolicy="no-referrer" sizes="64px" />
                        <button type="button" onClick={() => handleRemoveImage(i)} className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:col-span-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input name="isFeatured" type="checkbox" defaultChecked={editingProd?.isFeatured || false} className="border-slate-300 text-blue-600 w-4 h-4 rounded" />
                    <span>Highlight as Featured</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input name="isActive" type="checkbox" defaultChecked={editingProd ? editingProd.isActive : true} className="border-slate-300 text-blue-600 w-4 h-4 rounded" />
                    <span>Active on Public Website</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5 shadow-sm rounded-xl">
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProd ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
