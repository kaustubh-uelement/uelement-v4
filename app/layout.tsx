import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/onest';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(company.site),
  title: {
    default: `UElement | ${company.tagline}`,
    template: '%s | UElement',
  },
  description:
    'UElement is a DeepTech company from Pune, India, building quantum-safe security, an enterprise data platform and sovereign edge AI for the systems that cannot fail.',
  openGraph: {
    type: 'website',
    siteName: 'UElement',
    locale: 'en_IN',
    url: company.site,
  },
  twitter: { card: 'summary_large_image' },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
