import React from 'react';
import { History } from 'lucide-react';
import { getAuditLogs } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const user = await requirePermission('view_activity_logs');

  const logs = getAuditLogs(100);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activity Logs"
        description="Chronological history of all admin logins, CRUD mutations, and ticket actions."
      />

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Latest {logs.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Staff Member</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Module</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
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
                  <td className="p-4 text-slate-700 font-medium capitalize whitespace-nowrap text-xs">
                    {log.entityType}
                  </td>
                  <td className="p-4 text-slate-600 leading-relaxed max-w-md text-xs">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </td>
                  <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                    {log.ipAddress || 'Internal'}
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