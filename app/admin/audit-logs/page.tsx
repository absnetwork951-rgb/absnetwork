import React from 'react';
import { History, Shield, Activity, Search } from 'lucide-react';
import { getAuditLogs } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const user = await requirePermission('view_activity_logs');

  const logs = getAuditLogs(100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-light text-slate-900">
          <span className="font-bold">System Security</span> &amp; Audit Trail
        </h2>
        <p className="text-xs text-slate-500 font-mono">Chronological history of all administrative logins, CRUD mutations, and ticket actions</p>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-mono font-bold text-[10px] bg-slate-50/70">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">Details</th>
                <th className="p-4 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap font-mono text-[11px]">
                    {log.userEmail || log.userId || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] uppercase font-bold rounded-full">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-semibold capitalize whitespace-nowrap font-mono text-[11px]">
                    {log.entityType}
                  </td>
                  <td className="p-4 text-slate-600 leading-relaxed max-w-md font-mono text-[11px]">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </td>
                  <td className="p-4 font-mono text-slate-400 text-[10px] whitespace-nowrap">
                    {log.ipAddress || 'Internal Gateway'}
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
