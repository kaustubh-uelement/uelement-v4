import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead } from '@/components/ui';
import { FormSection } from '@/components/blocks';
import { Icon, type IconName } from '@/components/Icon';
import { partners, programmes } from '@/lib/content';

export const metadata: Metadata = {
  title: 'UElement Partnerships',
  description: 'Resell, integrate with or take UElement to market. Our partner programmes and current partners.',
  alternates: { canonical: '/partnerships/' },
};

const icons: IconName[] = ['handshake', 'cube', 'globe'];

export default function PartnershipsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Partnerships' }]} chip="UElement Partnerships" chipIcon="handshake" title="We go further together." lede="Resell our products, build integrations with them, or take them to new regions and industries. Every partnership starts with a shared plan and goals we can measure.">
        <a className="btn btn--metal" href="#form">
          Become a partner
        </a>
        <a className="btn btn--glass" href="#programmes">
          See the programmes
        </a>
      </PageHero>

      <section className="panel panel--paper section" id="programmes">
        <div className="wrap">
          <SectionHead chip="Programmes" chipIcon="compass" title="Three ways to partner" />
          <div className="grid-3">
            {programmes.map((p, i) => (
              <Link key={p.slug} href={`/partnerships/${p.slug}/`} className="paper-card paper-card--pad card-link">
                <span className="medal medal--lg">
                  <Icon name={icons[i]} />
                </span>
                <h3 className="h3" style={{ marginTop: 8 }}>
                  {p.name}
                </h3>
                <p className="muted">{p.summary}</p>
                <span className="card-foot text-link">
                  {p.nav}
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Current partners" chipIcon="star" title="Who we work with today" />
          <div className="grid-3">
            {partners.map((p) => (
              <div className="glass-card glass-card--pad" key={p.name} style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 className="h3">{p.name}</h3>
                <p className="gold small" style={{ fontWeight: 560 }}>
                  {p.area}
                </p>
                <p className="muted small">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FormSection kind="partner" chip="Become a partner" title="Tell us about your business." text="Your customers, your regions and what you would like to build together." />
    </>
  );
}
