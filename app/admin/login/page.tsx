import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // Once a session cookie is present (e.g. right after a successful login
  // action, or when an already-logged-in user opens /admin/login), render the
  // dashboard instead of the login form. Without this, the admin layout would
  // show the sidebar alongside the login form and the middleware's per-request
  // redirect for authenticated users on /admin/login would not cover the RSC
  // client re-render path, leaving the user stranded on a mixed page.
  const user = await getCurrentSession();
  if (user) {
    redirect('/admin/dashboard');
  }
  return <AdminLoginForm />;
}
