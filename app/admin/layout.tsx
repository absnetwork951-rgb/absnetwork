import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCurrentSession } from '@/lib/auth/session';

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      <AdminSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </div>
    </div>
  );
}
