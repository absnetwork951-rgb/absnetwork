import type { Metadata } from 'next';
import './globals.css';
import { getSiteSettings } from '@/lib/db';
import {
  getSiteUrl,
  BRANDED_SOCIAL_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

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
    'IT Services Islamabad',
    'Networking Solutions Pakistan',
  ],
  applicationName: 'ABS Network Broadband',
  authors: [{ name: 'ABS Network Broadband SMC-Pvt-Ltd', url: getSiteUrl() }],
  creator: 'ABS Network Broadband SMC-Pvt-Ltd',
  publisher: 'ABS Network Broadband SMC-Pvt-Ltd',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getSiteUrl(),
    siteName: 'ABS Network Broadband',
    title: 'ABS Network Broadband SMC-Pvt-Ltd | Fiber Internet & Networking Equipment',
    description: 'High-speed fiber broadband, enterprise network solutions, IT services, and professional networking equipment.',
    images: [
      {
        url: BRANDED_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: 'ABS Network Broadband - Fiber Optic Internet & Networking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABS Network Broadband SMC-Pvt-Ltd',
    description: 'High-speed fiber broadband, enterprise network solutions, and professional networking equipment.',
    images: [BRANDED_SOCIAL_IMAGE],
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // metadataBase is defined in the static export above; these JSON-LD blocks
  // use the live site URL so they stay in sync with production regardless of env.
  const settings = getSiteSettings();
  const orgLd = organizationJsonLd(settings);
  const siteLd = websiteJsonLd(settings);

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-white text-slate-800 antialiased min-h-screen selection:bg-blue-600 selection:text-white font-sans" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
        />
        {children}
      </body>
    </html>
  );
}
