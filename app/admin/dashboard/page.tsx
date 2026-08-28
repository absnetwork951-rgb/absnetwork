import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Inbox,
  ShoppingBag,
  ArrowRight,
  Network,
  Plus,
} from 'lucide-react';
import { requireSession } from '@/lib/auth/guards';
import {
  getPackages,
  getShopProducts,
  getContactSubmissions,
  getShopOrders,
  getAuditLogs,
} from '@/lib/db';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  quoted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default async function AdminDashboardPage() {
  const user = await requireSession();

  const packages = getPackages();
  const shopProducts = getShopProducts();
  const submissions = getContactSubmissions();
  const orders = getShopOrders();
  const auditLogs = getAuditLogs(8);

  const pendingSubmissions = submissions.filter((s) => s.status === 'new');
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'contacted' || o.status === 'quoted');

  const badgeFor = (status: string) =>
    STATUS_BADGE[status] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Welcome back, ${user.name}`}
        description="Overview of packages, sales inquiries, and orders across ABS Network."
        actions={
          <>
            <Link href="/admin/packages" className="btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" />
              New Package
            </Link>
            <Link href="/admin/shop" className="btn-secondary btn-sm">
              <Plus className="w-3.5 h-3.5" />
              New Shop Product
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Broadband Plans"
          value={packages.length}
          icon={Wifi}
          href="/admin/packages"
          footer={<>{packages.filter((p) => p.isActive).length} active plans</>}
        />
        <StatCard
          label="Shop Products"
          value={shopProducts.length}
          icon={Network}
          href="/admin/shop"
          footer={<>{shopProducts.filter((p) => p.isActive).length} in catalog</>}
        />
        <StatCard
          label="Inquiries"
          value={submissions.length}
          icon={Inbox}
          href="/admin/submissions"
          footer={<>{pendingSubmissions.length} need action</>}
        />
        <StatCard
          label="Shop Orders"
          value={orders.length}
          icon={ShoppingBag}
          iconBgClass="bg-slate-100 text-slate-700"
          href="/admin/orders"
          footer={<>{pendingOrders.length} pending follow-up</>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Inquiries</h2>
              <p className="text-sm text-slate-500">Latest broadband and service applications</p>
            </div>
            <Link href="/admin/submissions" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {submissions.slice(0, 4).map((sub) => (
              <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{sub.fullName}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {sub.inquiryType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">{sub.subject}</div>
                  <div className="text-xs text-slate-400">{sub.phone}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badgeFor(sub.status)}`}>
                    {sub.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
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
              <h2 className="text-base font-bold text-slate-900">Recent Shop Orders</h2>
              <p className="text-sm text-slate-500">Equipment order inquiries and follow-ups</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map((ord) => (
              <div key={ord.id} className="p-3.5 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{ord.customerName}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {ord.orderNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 truncate">{ord.productName} (x{ord.quantity})</div>
                  <div className="text-xs text-slate-500 capitalize">{ord.city} · {ord.phone}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-slate-900">
                    PKR {(ord.estimatedTotalPkr ?? 0).toLocaleString()}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1 inline-block ${badgeFor(ord.status)}`}>
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <p className="text-sm text-slate-500">Latest audit log entries</p>
          </div>
          <Link href="/admin/audit-logs" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Full Audit Logs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Module</th>
                <th className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-slate-900 whitespace-nowrap text-xs">
                    {log.userEmail || log.userId || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 capitalize text-xs">{log.entityType}</td>
                  <td className="p-4 text-slate-500 text-xs truncate max-w-xs">
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