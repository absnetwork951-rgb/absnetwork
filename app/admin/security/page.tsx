import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { ShieldAlert, AlertTriangle, Info, Activity } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { getSecurityEvents } from '@/lib/db';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

const severityStyles: Record<string, string> = {
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
};

const eventTypeStyles: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOGIN_FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  LOGOUT: 'bg-slate-100 text-slate-600 border-slate-200',
  RATE_LIMITED: 'bg-amber-50 text-amber-700 border-amber-200',
  SESSION_REVOKED: 'bg-orange-50 text-orange-700 border-orange-200',
  PERMISSION_DENIED: 'bg-rose-50 text-rose-700 border-rose-200',
  UNAUTHORIZED_ACCESS: 'bg-rose-50 text-rose-700 border-rose-200',
  USER_CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
  USER_ROLE_CHANGED: 'bg-amber-50 text-amber-700 border-amber-200',
  USER_DISABLED: 'bg-orange-50 text-orange-700 border-orange-200',
  USER_DELETED: 'bg-rose-50 text-rose-700 border-rose-200',
  PASSWORD_CHANGED: 'bg-blue-50 text-blue-700 border-blue-200',
  SUSPICIOUS_REQUEST: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default async function AdminSecurityPage() {
  const user = await getCurrentSession();
  if (!user) redirect('/admin/login');

  if (!hasPermission(user.role, 'view_security')) {
    notFound();
  }

  const events = getSecurityEvents(100);

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;
  const warningCount = events.filter((e) => e.severity === 'WARNING').length;
  const loginFailures = events.filter((e) => e.eventType === 'LOGIN_FAILED').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security Dashboard"
        description="Security events and access anomalies from the ABS Network control plane."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Total Events" value={events.length} icon={Activity} />
        <StatCard
          label="Critical"
          value={criticalCount}
          icon={ShieldAlert}
          iconBgClass="bg-rose-50 text-rose-600"
        />
        <StatCard
          label="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          iconBgClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Login Failures"
          value={loginFailures}
          icon={Info}
          iconBgClass="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900">Security Event Stream</h2>
          <p className="text-sm text-slate-500">Latest 100 events</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Severity</th>
                <th className="p-4 font-semibold">Event</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${severityStyles[event.severity] || severityStyles.INFO}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${eventTypeStyles[event.eventType] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {event.eventType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 leading-relaxed max-w-md text-xs">
                    {event.description}
                  </td>
                  <td className="p-4 text-slate-700 text-xs whitespace-nowrap">
                    {event.userEmail || event.userId || 'System'}
                  </td>
                  <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                    {event.ipAddress || 'Internal'}
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