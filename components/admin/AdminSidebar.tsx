'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wifi,
  ShoppingBag,
  Settings,
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
      { href: '/admin/shop', label: 'Shop Products', icon: ShoppingBag, permission: 'manage_shop_products' },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, permission: 'manage_orders' },
      { href: '/admin/settings', label: 'Site Settings', icon: Settings, permission: 'manage_settings' },
    ],
  },
  {
    section: 'Monitor',
    items: [
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
    <aside className="w-64 min-h-screen admin-sidebar text-white flex flex-col shrink-0 sticky top-0 h-screen" style={{ backgroundColor: 'var(--admin-sidebar-bg)' }}>
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--admin-border-strong, #1e293b)' }}>
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-950/50 ring-1 ring-white/10 group-hover:shadow-blue-900/60 transition-shadow">
            ABS
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-white">ABS Network</div>
            <div className="text-xs" style={{ color: 'var(--admin-sidebar-muted)' }}>Admin Control</div>
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
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--admin-sidebar-muted)' }}>
                {group.section}
              </div>
              <div className="space-y-1">
                {visible.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                          : 'hover:bg-slate-800 hover:text-white'
                      }`}
                      style={active ? undefined : { color: 'var(--admin-sidebar-muted)' }}
                    >
                      <span
                        className={`w-1 h-4 rounded-full transition-colors ${
                          active ? 'bg-white' : 'bg-transparent group-hover:bg-slate-500'
                        }`}
                      />
                      <item.icon className="shrink-0" style={{ width: 18, height: 18 }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--admin-border-strong, #1e293b)' }}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 font-bold text-sm flex items-center justify-center shrink-0 ring-1 ring-white/5">
            {initials || 'A'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-sm font-semibold text-white truncate">{user.name}</div>
            <div className="text-xs truncate capitalize" style={{ color: 'var(--admin-sidebar-muted)' }}>{user.role.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            style={{ color: 'var(--admin-sidebar-muted)' }}
          >
            <LogOut className="shrink-0" style={{ width: 18, height: 18 }} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}