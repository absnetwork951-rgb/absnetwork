'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Shield,
  Key,
} from 'lucide-react';
import { AdminUser, AdminRole } from '@/lib/db/types';
import { canManageRole } from '@/lib/auth/rbac';
import {
  createAdminUserAction,
  updateAdminUserAction,
  deleteAdminUserAction,
  resetPasswordAction,
} from '@/lib/actions/admin-users';

interface UsersManagerClientProps {
  initialUsers: AdminUser[];
  currentUser: AdminUser;
}

export default function UsersManagerClient({
  initialUsers,
  currentUser,
}: UsersManagerClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleOpenCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u);
    setModalOpen(true);
  };

  const handleOpenReset = (u: AdminUser) => {
    setSelectedUser(u);
    setNewPassword('');
    setResetModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingUser) {
        formData.set('id', editingUser.id);
        const res = await updateAdminUserAction(formData);
        if (res.success) {
          const role = formData.get('role') as AdminRole;
          const name = formData.get('name') as string;
          const email = formData.get('email') as string;
          const isActive = formData.get('isActive') === 'true' || formData.get('isActive') === 'on';

          setUsers(
            users.map((u) =>
              u.id === editingUser.id
                ? { ...u, name: name || u.name, email: email || u.email, role: role || u.role, isActive }
                : u
            )
          );
          setNotification({ type: 'success', message: 'User updated successfully!' });
          setModalOpen(false);
        } else {
          setNotification({ type: 'error', message: res.error || 'Failed to update user' });
        }
      } else {
        const res = await createAdminUserAction(formData);
        if (res.success) {
          const name = formData.get('name') as string;
          const email = formData.get('email') as string;
          const role = formData.get('role') as AdminRole;
          const newUser: AdminUser = {
            id: `usr_${Date.now()}`,
            name,
            email,
            passwordHash: '',
            role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUsers([...users, newUser]);
          setNotification({ type: 'success', message: 'New admin user created!' });
          setModalOpen(false);
        } else {
          setNotification({ type: 'error', message: res.error || 'Failed to create user' });
        }
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setLoading(true);

    try {
      const res = await resetPasswordAction(selectedUser.id, newPassword);
      if (res.success) {
        setNotification({ type: 'success', message: `Password reset for ${selectedUser.name}.` });
        setResetModalOpen(false);
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to reset password' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    setLoading(true);

    try {
      const res = await deleteAdminUserAction(id);
      if (res.success) {
        setUsers(users.filter((u) => u.id !== id));
        setNotification({ type: 'success', message: `User "${name}" removed.` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete user' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ADMIN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CONTENT_MANAGER':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SALES_MANAGER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUPPORT_AGENT':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SECURITY_AUDITOR':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Team &amp; Access Control</h2>
          <p className="text-sm text-slate-500">Manage administrator privileges, NOC staff, and role authorizations</p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary btn-sm shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Create Admin User
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

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const canManage = canManageRole(currentUser.role, u.role) && u.id !== currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="text-[9px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReset(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200 transition-colors rounded-lg"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors rounded-lg"
                            title="Edit Role/Status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit User Credentials & Role' : 'Create Admin Team Member'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingUser?.name || ''}
                  placeholder="e.g. Asad Ullah"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Corporate Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={editingUser?.email || ''}
                  placeholder="name@absbroadband.pk"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Initial Password *</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Set a unique strong password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">RBAC Role Assignment *</label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || 'CONTENT_MANAGER'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none rounded-xl"
                >
                  {currentUser.role === 'SUPER_ADMIN' && (
                    <>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Full Root Permissions)</option>
                      <option value="ADMIN">ADMIN (All Modules except Root)</option>
                    </>
                  )}
                  <option value="CONTENT_MANAGER">CONTENT_MANAGER (Packages, Services &amp; Shop)</option>
                  <option value="SALES_MANAGER">SALES_MANAGER (Orders &amp; Inquiries)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Inquiries)</option>
                  <option value="SECURITY_AUDITOR">SECURITY_AUDITOR (Security &amp; Audit Logs)</option>
                </select>
              </div>

              {editingUser && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingUser.isActive}
                      className="border-slate-300 text-blue-600 w-4 h-4 rounded-md"
                    />
                    <span>Account Active (Allowed to sign in)</span>
                  </label>
                </div>
              )}

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
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Reset Password for {selectedUser.name}
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:border-blue-600 focus:outline-none font-mono rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Resetting...' : 'Confirm Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
