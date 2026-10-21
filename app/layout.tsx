import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@fontsource-variable/onest';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { CookieModal } from '@/components/CookieModal';
import { RestrictedModal } from '@/components/RestrictedModal';
import { company } from '@/lib/site';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-SF70DJKM92';

export const metadata: Metadata = {
  metadataBase: new URL(company.site),
  title: {
    default: 'UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises',
    template: '%s | UElement',
  },
  description:
    'Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'UElement Technologies',
    locale: 'en_IN',
    url: company.site,
    title: 'UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises',
    description:
      'Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'UElement Technologies — Sovereign DeepTech systems for Resilient Enterprises',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises',
    description:
      'Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#060B18',
  colorScheme: 'dark',
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.name,
  alternateName: 'UElement',
  url: company.site,
  logo: `${company.site}/logo.png`,
  image: `${company.site}/og-image.png`,
  description:
    'Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.',
  email: company.email,
  telephone: company.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Wakad, Pune',
    addressRegion: 'Maharashtra',
    postalCode: '411057',
    addressCountry: 'IN',
  },
  slogan: company.statement,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <div className="frame">
          <main id="main" className="frame" style={{ padding: 0 }}>
            {children}
          </main>
          <Footer />
        </div>
        <ScrollToTop />
        <CookieModal />
        <RestrictedModal />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
