import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | ABS Network Broadband',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-blue-600">404</p>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          This page could not be found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist, was removed, or the
          address is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}