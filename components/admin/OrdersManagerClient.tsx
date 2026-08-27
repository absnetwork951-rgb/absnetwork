'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ShopInquiryOrder } from '@/lib/db/types';
import {
  updateOrderStatusAction,
  deleteOrderAction,
} from '@/lib/actions/admin-orders';

interface OrdersManagerClientProps {
  initialOrders: ShopInquiryOrder[];
}

export default function OrdersManagerClient({
  initialOrders,
}: OrdersManagerClientProps) {
  const [orders, setOrders] = useState<ShopInquiryOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ShopInquiryOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ShopInquiryOrder['status']>('pending_feasibility');

  const filtered = orders.filter((ord) => {
    if (filterStatus !== 'all' && ord.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.toLowerCase().includes(q) ||
        ord.email.toLowerCase().includes(q) ||
        (ord.productName || '').toLowerCase().includes(q) ||
        ord.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenDetail = (ord: ShopInquiryOrder) => {
    setSelectedOrder(ord);
    setAdminNotes(ord.adminNotes || '');
    setCurrentStatus(ord.status);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setLoading(true);

    try {
      const res = await updateOrderStatusAction(selectedOrder.id, currentStatus, adminNotes);
      if (res.success && res.order) {
        setOrders(orders.map((o) => (o.id === res.order!.id ? res.order! : o)));
        setSelectedOrder(res.order);
        alert('Shop order status & notes updated.');
      } else {
        alert(res.error || 'Failed to update order');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, orderNum: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNum}?`)) return;
    try {
      const res = await deleteOrderAction(id);
      if (res.success) {
        setOrders(orders.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: ShopInquiryOrder['status']) => {
    switch (status) {
      case 'pending_feasibility':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'survey_booked':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'quote_sent':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'approved':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'in_installation':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-light text-slate-900">
          <span className="font-bold">Shop Orders</span> &amp; Inquiry Pipeline
        </h2>
        <p className="text-xs text-slate-500 font-mono">Rooftop surveys, Net Metering feasibility, and equipment delivery tracking</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order #, Customer Name, Phone, City, Product..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 rounded-xl"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-blue-600 focus:outline-none capitalize rounded-xl"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="pending_feasibility">Pending Feasibility</option>
            <option value="survey_booked">Survey Booked</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="approved">Approved &amp; Paid</option>
            <option value="in_installation">In Installation</option>
            <option value="completed">Completed / Net Metered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-mono font-bold text-[10px] bg-slate-50/70">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Product &amp; Qty</th>
                <th className="p-4">Est. Total (PKR)</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                    {ord.orderNumber}
                  </td>
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                    <div>{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ord.phone}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate">{ord.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Qty: {ord.quantity} Unit(s)</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap font-mono">
                    PKR {(ord.estimatedTotalPkr ?? 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-700">
                    <div>{ord.city}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{ord.address}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border capitalize whitespace-nowrap ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ord.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 whitespace-nowrap font-mono text-[10px]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] transition-colors rounded-lg"
                      >
                        Manage Pipeline
                      </button>
                      <button
                        onClick={() => handleDelete(ord.id, ord.orderNumber)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg"
                        title="Delete Order"
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

      {/* Shop Order Pipeline Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Shop Order &amp; Inquiry Track: {selectedOrder.orderNumber}
                </h3>
                <div className="text-xs text-slate-500">{selectedOrder.customerName} &bull; {selectedOrder.city}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Order Specs Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Ordered Product:</span>
                    <span className="text-slate-900 font-bold">{selectedOrder.productName || 'Custom Product Order'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Order Total:</span>
                    <span className="text-blue-600 font-bold text-sm font-mono">
                      PKR {(selectedOrder.estimatedTotalPkr ?? 0).toLocaleString()} (x{selectedOrder.quantity})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Customer Contact:</span>
                    <span className="text-slate-900 font-mono font-bold">{selectedOrder.phone}</span>
                    <span className="text-slate-500 block text-[11px] font-mono">{selectedOrder.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Installation Site Address:</span>
                    <span className="text-slate-700">{selectedOrder.address}, {selectedOrder.city}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-0.5 font-mono text-[10px] uppercase">Customer Roof Notes:</span>
                    <div className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Updater */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Engineering Pipeline Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                >
                  <option value="pending_feasibility">Pending Feasibility Check</option>
                  <option value="survey_booked">Rooftop Physical Survey Booked</option>
                  <option value="quote_sent">Detailed 3D Design &amp; Formal Quotation Sent</option>
                  <option value="approved">Approved &amp; Advance Paid</option>
                  <option value="in_installation">In Installation / Galvanized Framing</option>
                  <option value="completed">Completed &amp; Green Net Meter Activated</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Admin Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Engineering &amp; Feasibility Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Record structural survey findings, inverter model allocations, DISCO file submission dates..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-blue-600 focus:outline-none resize-none rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5 shadow-sm rounded-xl"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Order Pipeline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
