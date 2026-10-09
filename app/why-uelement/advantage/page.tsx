import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { advantages, usualVsUs, partners } from '@/lib/content';

export const metadata: Metadata = {
  title: 'The UElement Advantage',
  description: 'Six reasons teams build with UElement.',
  alternates: { canonical: '/why-uelement/advantage/' },
};

const icons: IconName[] = ['globe', 'key', 'layers', 'eye', 'people', 'shield'];

export default function AdvantagePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Why UElement', href: '/why-uelement/' }, { label: 'The UElement Advantage' }]}
        chip="The UElement Advantage"
        chipIcon="star"
        title="Six reasons teams build with UElement."
      />

      <section className="panel panel--paper section">
        <div className="wrap">
          <div className="grid-3">
            {advantages.map((a, i) => (
              <div className="paper-card paper-card--pad" key={a.title} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <span className="medal">
                  <Icon name={icons[i]} />
                </span>
                <h2 className="h3" style={{ marginTop: 4 }}>
                  {a.title}
                </h2>
                <p className="muted">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <SectionHead chip="The difference" chipIcon="compass" title="What changes when you work with us" />
          <div className="paper-card" style={{ overflow: 'hidden' }}>
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">The usual way</th>
                  <th scope="col" className="gold">
                    The UElement way
                  </th>
                </tr>
              </thead>
              <tbody>
                {usualVsUs.map(([a, b]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Partners" chipIcon="handshake" title="Stronger with our partners" text="Data protection, DPDP compliance and wider reach, delivered together." />
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

      <CtaPanel title="See it for yourself, at a fixed scope." />
    </>
  );
}
