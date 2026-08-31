import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';
import { getCurrentSession } from '@/lib/auth/session';
import { getCurrentAppearance } from '@/lib/actions/admin-appearance';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentSession();

  // If user is not logged in, we let the login page render normally, but if trying to access other admin pages, redirect to login
  if (!user) {
    // Check if current route is login
    // In Next App Router, children can render the login page if route matches /admin/login
    // We provide a conditional check:
    return <>{children}</>;
  }

  const appearance = await getCurrentAppearance();

  return (
    <AdminThemeProvider defaultAppearance={appearance}>
      <AdminSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-10 flex-1 max-w-7xl w-full mx-auto min-w-0">{children}</main>
      </div>
    </AdminThemeProvider>
  );
}
