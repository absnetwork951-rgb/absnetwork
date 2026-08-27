import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Inbox,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Activity,
  Plus,
  Network,
} from 'lucide-react';
import { requireSession } from '@/lib/auth/guards';
import {
  getPackages,
  getServices,
  getShopProducts,
  getContactSubmissions,
  getShopOrders,
  getAuditLogs,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireSession();

  const packages = getPackages();
  const services = getServices();
  const shopProducts = getShopProducts();
  const submissions = getContactSubmissions();
  const orders = getShopOrders();
  const auditLogs = getAuditLogs(8);

  const pendingSubmissions = submissions.filter((s) => s.status === 'new');
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'contacted' || o.status === 'quoted');

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>ABS Network Control Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-900">
            Welcome back, <span className="font-bold">{user.name}</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            System Status: <strong className="text-emerald-700">All Nodes Operational (99.99%)</strong> &bull; Role: <strong className="capitalize text-blue-700">{user.role.replace('_', ' ')}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/packages"
            className="px-4 py-2.5 font-bold uppercase tracking-wider text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center gap-1.5 shadow-sm transition-colors rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Package</span>
          </Link>

          <Link
            href="/admin/shop"
            className="px-4 py-2.5 font-bold uppercase tracking-wider text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-colors rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Shop Product</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/admin/packages"
          className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 space-y-3 transition-all group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Broadband Plans</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{packages.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <span>{packages.filter((p) => p.isActive).length} Active Live</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/shop"
          className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 space-y-3 transition-all group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Shop Products</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{shopProducts.length}</div>
          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
            <span>{shopProducts.filter((p) => p.isActive).length} In Shop Catalog</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/submissions"
          className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 space-y-3 transition-all group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Inquiries / Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{submissions.length}</div>
          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
            <span>{pendingSubmissions.length} Action Needed</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 space-y-3 transition-all group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Shop Orders</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{orders.length}</div>
          <div className="text-[10px] text-slate-700 font-semibold flex items-center gap-1">
            <span>{pendingOrders.length} Pending Follow-up</span>
            <ArrowRight className="w-2.5 h-2.5 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Inquiries</h3>
              <p className="text-xs text-slate-500">Latest broadband and service applications</p>
            </div>
            <Link href="/admin/submissions" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {submissions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sub.fullName}</span>
                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {sub.inquiryType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">{sub.subject}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{sub.phone}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[9px] uppercase font-semibold px-2.5 py-0.5 rounded-full border ${sub.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : sub.status === 'in_review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Shop Orders</h3>
              <p className="text-xs text-slate-500">Equipment order inquiries and follow-ups</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map((ord) => (
              <div key={ord.id} className="p-3.5 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ord.customerName}</span>
                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {ord.orderNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 truncate">{ord.productName} (x{ord.quantity})</div>
                  <div className="text-[10px] text-slate-500 font-mono">{ord.city} &bull; {ord.phone}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-900 font-sans">
                    PKR {(ord.estimatedTotalPkr ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[9px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 mt-1 inline-block">
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
              SECURITY &amp; AUDIT LOG STREAM
            </h3>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
            Full Audit Logs &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono font-bold text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px]">
                    {log.userEmail || log.userId || 'System'}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[10px] uppercase font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-mono capitalize">{log.entityType}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
