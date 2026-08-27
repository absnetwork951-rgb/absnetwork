import Link from 'next/link';
import { hasPermission, type Permission } from '@/lib/auth/rbac';
import { type AdminRole } from '@/lib/db/types';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: AdminRole;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const p = (perm: Permission) => hasPermission(user.role, perm);

  const linkClass =
    'block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <h2 className="text-lg font-bold tracking-wide">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm font-medium">
        <Link href="/admin/dashboard" className={linkClass}>
          Dashboard
        </Link>
        {p('manage_packages') && (
          <Link href="/admin/packages" className={linkClass}>
            Packages
          </Link>
        )}
        {p('manage_services') && (
          <Link href="/admin/services" className={linkClass}>
            Services
          </Link>
        )}
        {p('manage_shop_products') && (
          <Link href="/admin/shop" className={linkClass}>
            Shop Products
          </Link>
        )}
        {p('manage_orders') && (
          <Link href="/admin/orders" className={linkClass}>
            Orders
          </Link>
        )}
        {p('manage_contact_submissions') && (
          <Link href="/admin/submissions" className={linkClass}>
            Contact Submissions
          </Link>
        )}
        {p('manage_users') && (
          <Link href="/admin/users" className={linkClass}>
            User Management
          </Link>
        )}
        {p('manage_settings') && (
          <Link href="/admin/settings" className={linkClass}>
            Site Settings
          </Link>
        )}
        {p('view_activity_logs') && (
          <Link href="/admin/audit-logs" className={linkClass}>
            Activity Logs
          </Link>
        )}
        {p('view_security') && (
          <Link href="/admin/security" className={linkClass}>
            Security Dashboard
          </Link>
        )}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400 space-y-0.5">
        <div>
          Logged in as: <span className="text-white font-semibold">{user.name}</span>
        </div>
        <div className="font-mono truncate">{user.email}</div>
        <div>
          Role: <span className="text-blue-400 font-semibold">{user.role}</span>
        </div>
      </div>
    </aside>
  );
}