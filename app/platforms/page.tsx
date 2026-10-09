import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, Chip, StatusBadge, CtaPanel } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { platforms } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Platforms',
  description: 'U92 Quantum, U92 Enterprise and U92 Deeptech: quantum-safe security, a unified enterprise data plane and sovereign edge AI.',
  alternates: { canonical: '/platforms/' },
};

const maturity = [
  { status: 'Live' as const, text: 'In customer use today.' },
  { status: 'Pilot' as const, text: 'Paid pilots under way with customers.' },
  { status: 'In build' as const, text: 'Being engineered now, with design partners.' },
  { status: 'Designed' as const, text: 'Architecture complete; looking for design partners.' },
];

export default function PlatformsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Platforms' }]}
        chip="Three platforms, thirteen products"
        chipIcon="layers"
        title="Platforms for the systems that cannot fail."
        lede="Quantum-safe security, one data plane for the enterprise and sovereign AI at the edge. Each product carries an honest maturity label, so you know what is live and what is still being built."
      >
        <Link className="btn btn--metal" href="/support/demo/">
          Book a demo
        </Link>
        <a className="btn btn--glass" href="#maturity">
          What the labels mean
        </a>
      </PageHero>

      {platforms.map((p, i) => {
        const dark = i % 2 === 0;
        return (
          <section key={p.slug} className={`panel ${dark ? 'panel--enamel' : 'panel--paper'} section`} aria-labelledby={`pf-${p.slug}`}>
            <div className="wrap" style={{ display: 'grid', gap: 'clamp(32px, 5vw, 80px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 20, justifyItems: 'start', position: 'sticky', top: 120 }}>
                <Chip icon={['key', 'layers', 'mesh'][i] as 'key'}>{p.alias}</Chip>
                <h2 id={`pf-${p.slug}`} className="h2">
                  {p.name}
                </h2>
                <p className="statement" style={{ fontSize: 'clamp(26px, 2.6vw, 36px)' }}>
                  {p.promise}
                </p>
                <p className="muted">{p.summary}</p>
                <Link className={`btn ${dark ? 'btn--glass' : 'btn--ink'}`} href={`/platforms/${p.slug}/`}>
                  Explore {p.name}
                </Link>
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
                {p.products.map((x) => (
                  <li key={x.slug}>
                    <Link href={`/platforms/${p.slug}/${x.slug}/`} className={`${dark ? 'glass-card' : 'paper-card'} card-link`} style={{ padding: '22px 24px', flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                      <span style={{ flex: 1, display: 'grid', gap: 4 }}>
                        <span className="h4">{x.name}</span>
                        <span className="muted small">{x.short}</span>
                      </span>
                      <StatusBadge status={x.status} />
                      <Icon name="arrow" className="gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="panel panel--creme section--tight" id="maturity">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">What the labels mean</h2>
            <p className="lede muted">We claim only what we can show. Planned and Research mean exactly that.</p>
          </div>
          <div className="grid-4">
            {maturity.map((m) => (
              <div className="paper-card paper-card--pad" key={m.status} style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
                <StatusBadge status={m.status} />
                <p className="muted small">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaPanel title="Not sure where to start?" text="Most teams begin with a quantum readiness scan, a 45-day Vizor proof of value or a Nexus package plan." />
    </>
  );
}
