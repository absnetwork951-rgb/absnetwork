'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wifi,
  Server,
  ShoppingBag,
  Inbox,
  Users,
  Settings,
  History,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { hasPermission, type Permission } from '@/lib/auth/rbac';
import { type AdminRole } from '@/lib/db/types';
import { logoutAction } from '@/lib/actions/auth';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: AdminRole;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission | null;
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null }],
  },
  {
    section: 'Management',
    items: [
      { href: '/admin/packages', label: 'Packages', icon: Wifi, permission: 'manage_packages' },
      { href: '/admin/services', label: 'Services', icon: Server, permission: 'manage_services' },
      { href: '/admin/shop', label: 'Shop Products', icon: ShoppingBag, permission: 'manage_shop_products' },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, permission: 'manage_orders' },
      { href: '/admin/submissions', label: 'Inquiries', icon: Inbox, permission: 'manage_contact_submissions' },
      { href: '/admin/users', label: 'Admin Users', icon: Users, permission: 'manage_users' },
      { href: '/admin/settings', label: 'Site Settings', icon: Settings, permission: 'manage_settings' },
    ],
  },
  {
    section: 'Monitor',
    items: [
      { href: '/admin/audit-logs', label: 'Activity Logs', icon: History, permission: 'view_activity_logs' },
      { href: '/admin/security', label: 'Security', icon: ShieldCheck, permission: 'view_security' },
    ],
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen">
      <div className="px-6 py-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            ABS
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">ABS Network</div>
            <div className="text-xs text-slate-400">Admin Control</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {NAV_ITEMS.map((group) => {
          const visible = group.items.filter(
            (item) => item.permission === null || hasPermission(user.role, item.permission)
          );
          if (visible.length === 0) return null;
          return (
            <div key={group.section} className="space-y-1">
              <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 font-bold text-sm flex items-center justify-center shrink-0">
            {initials || 'A'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-sm font-semibold text-white truncate">{user.name}</div>
            <div className="text-xs text-slate-400 truncate capitalize">{user.role.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="shrink-0" style={{ width: 18, height: 18 }} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}