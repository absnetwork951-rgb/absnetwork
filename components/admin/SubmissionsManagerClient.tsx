'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { ContactSubmission } from '@/lib/db/types';
import {
  updateSubmissionStatusAction,
  deleteSubmissionAction,
} from '@/lib/actions/admin-submissions';

interface SubmissionsManagerClientProps {
  initialSubmissions: ContactSubmission[];
}

export default function SubmissionsManagerClient({
  initialSubmissions,
}: SubmissionsManagerClientProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ContactSubmission['status']>('new');

  const filtered = submissions.filter((s) => {
    if (filterType !== 'all' && s.inquiryType !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        s.fullName.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenDetail = (sub: ContactSubmission) => {
    setSelectedSub(sub);
    setAdminNotes(sub.adminNotes || '');
    setCurrentStatus(sub.status);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setLoading(true);

    try {
      const res = await updateSubmissionStatusAction(selectedSub.id, currentStatus, adminNotes);
      if (res.success && res.submission) {
        setSubmissions(submissions.map((s) => (s.id === res.submission!.id ? res.submission! : s)));
        setSelectedSub(res.submission);
        alert('Submission status & internal notes updated.');
      } else {
        alert(res.error || 'Failed to update submission');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete submission from ${name}?`)) return;
    try {
      const res = await deleteSubmissionAction(id);
      if (res.success) {
        setSubmissions(submissions.filter((s) => s.id !== id));
        if (selectedSub?.id === id) setSelectedSub(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-light text-slate-900">
          <span className="font-bold">Contact &amp; Broadband</span> Submissions
        </h2>
        <p className="text-xs text-slate-500 font-mono">Incoming inquiries, new connection requests, and support tickets</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, email, or message..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 rounded-xl"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none capitalize rounded-xl"
          >
            <option value="all">All Departments</option>
            <option value="new_connection">New Connection</option>
            <option value="sales">Corporate Sales</option>
            <option value="networking_equipment">Equipment Sales</option>
            <option value="package_inquiry">Package Inquiry</option>
            <option value="technical_support">Technical Support</option>
            <option value="billing">Billing</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none capitalize rounded-xl"
          >
            <option value="all">All Statuses</option>
            <option value="new">New (Action Required)</option>
            <option value="in_review">In Review</option>
            <option value="contacted">Contacted Customer</option>
            <option value="resolved">Resolved / Installed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-mono font-bold text-[10px] bg-slate-50/70">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Subject &amp; Interest</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                    {sub.fullName}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] uppercase rounded-full">
                      {sub.inquiryType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate">{sub.subject}</div>
                    {sub.packageInterest && (
                      <div className="text-[10px] text-blue-600 font-medium truncate">
                        Interest: {sub.packageInterest}
                      </div>
                    )}
                  </td>
                  <td className="p-4 space-y-0.5 text-[11px]">
                    <div className="font-mono text-blue-700 font-bold">{sub.phone}</div>
                    <div className="text-slate-500 font-mono text-[10px]">{sub.email}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${
                        sub.status === 'new'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : sub.status === 'in_review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : sub.status === 'contacted'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : sub.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 whitespace-nowrap font-mono text-[10px]">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(sub)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 font-bold text-[11px] transition-colors rounded-lg"
                      >
                        Manage Ticket
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id, sub.fullName)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg"
                        title="Delete Ticket"
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

      {/* Ticket Management Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Inquiry Ticket #{selectedSub.id.slice(-6)}
                </h3>
                <div className="text-xs text-slate-500">{selectedSub.fullName} &bull; {selectedSub.phone}</div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Message Details Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Department:</span>
                    <span className="text-slate-900 font-bold uppercase">{selectedSub.inquiryType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Email Address:</span>
                    <span className="text-blue-700 font-mono">{selectedSub.email}</span>
                  </div>
                </div>

                {selectedSub.packageInterest && (
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Package / Product Interest:</span>
                    <span className="text-blue-700 font-bold font-mono">{selectedSub.packageInterest}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block font-mono text-[10px] uppercase mb-1">Customer Message:</span>
                  <div className="p-3 bg-white border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed font-sans rounded-lg">
                    {selectedSub.message}
                  </div>
                </div>
              </div>

              {/* Status Updater */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Ticket Status Workflow</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                >
                  <option value="new">New (Awaiting Review)</option>
                  <option value="in_review">In Review by NOC / Sales</option>
                  <option value="contacted">Customer Contacted / Survey Arranged</option>
                  <option value="resolved">Resolved / Installed</option>
                  <option value="archived">Archived / Closed</option>
                </select>
              </div>

              {/* Admin Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Internal NOC / Sales Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Record optical port test results, scheduled installation date, or technician assignments..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none resize-none font-mono rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
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
                  <span>Save Status &amp; Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
