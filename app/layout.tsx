import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ABS Network Broadband SMC-Pvt-Ltd | Fiber Optic Internet & Networking Equipment',
    template: '%s | ABS Network Broadband SMC-Pvt-Ltd',
  },
  description: 'High-speed symmetrical optical fiber broadband, enterprise dedicated internet access (DIA), managed network solutions, IT services, and professional networking equipment by ABS Network Broadband SMC-Pvt-Ltd.',
  keywords: [
    'ABS Network Broadband SMC-Pvt-Ltd',
    'Broadband Internet',
    'Optical Fiber',
    'FTTH',
    'Enterprise Leased Line',
    'Fiber Optic Cable',
    'Network Switches',
    'Routers',
    'Islamabad Rawalpindi ISP',
  ],
  openGraph: {
    title: 'ABS Network Broadband SMC-Pvt-Ltd | Fiber Internet & Networking Equipment',
    description: 'High-speed fiber broadband, enterprise network solutions, IT services, and professional networking equipment.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABS Network Broadband SMC-Pvt-Ltd',
    description: 'High-speed fiber broadband, enterprise network solutions, and professional networking equipment.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-white text-slate-800 antialiased min-h-screen selection:bg-blue-600 selection:text-white font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

