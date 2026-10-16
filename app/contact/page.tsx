import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PageHero, SectionHead } from '@/components/ui';
import { FormSection } from '@/components/blocks';
import { Icon } from '@/components/Icon';
import { company } from '@/lib/site';

import GlobalOperationsMap from '@/components/company/GlobalOperationsMap';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact UElement in Wakad, Pune: ${company.email}, ${company.phone}.`,
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Contact' }]} chip="Contact" chipIcon="chat" title="Let’s talk." lede="Building something that cannot fail? We’d like to hear about it." />
      <FormSection
        kind="contact"
        chip="Write to us"
        title="Send us a message."
        text="A project, a partnership, a role or a question. Tell us a little and we will get back to you."
        aside={
          <div className="grid" style={{ ['--gap' as string]: '10px', width: '100%', marginTop: 8 } as React.CSSProperties}>
            <a className="paper-card founder card-link" href={`mailto:${company.email}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="mail" />
              </span>
              <span className="founder__name">{company.email}</span>
            </a>
            <a className="paper-card founder card-link" href={`tel:${company.phoneHref}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="phone" />
              </span>
              <span className="founder__name">{company.phone}</span>
            </a>
            <div className="paper-card founder">
              <span className="medal">
                <Icon name="pin" />
              </span>
              <span className="founder__name">{company.address}</span>
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              Need help with a product? <Link className="text-link" href="/support/get-support/">Get support now</Link>
            </p>
          </div>
        }
      />

      {/* Global Operations */}
      <section className="panel panel--creme section" id="global-operations">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <SectionHead
            chip="Global Operations"
            chipIcon="globe"
            title="Delivering Sovereignty Globally."
            text="Headquartered in Pune, India, with regional hubs in the UAE and Singapore, and active deployments across critical enterprises worldwide."
            center
          />

          <GlobalOperationsMap />

          <div
            style={{
              marginTop: 24,
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: 860,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px 10px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {[
                'UAE',
                'Singapore',
                'Malaysia',
                'USA',
                'Netherlands',
                'Australia',
                'Hongkong',
                'South Africa',
                'Vietnam',
                'Saudi Arabia',
                'France',
                'Germany',
                'Denmark',
                'United Kingdom',
                'Canada',
                'Mauritius',
              ].map((country) => (
                <div key={country} className="country-tag">
                  {country}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
