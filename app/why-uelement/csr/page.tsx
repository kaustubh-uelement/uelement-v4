import type { Metadata } from 'next';
import { PageHero, CtaPanel, WithPlaceholders } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { csr } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description: 'How UElement puts its time and skills to work for people and the planet.',
  alternates: { canonical: '/why-uelement/csr/' },
};

const icons: IconName[] = ['book', 'people', 'leaf'];

export default function CsrPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Why UElement', href: '/why-uelement/' }, { label: 'Corporate Social Responsibility' }]}
        chip="Corporate Social Responsibility"
        chipIcon="leaf"
        title="A company that preaches repair must practise it."
        lede="Profit funds our purpose. Here is how we put our time and skills to work for people and the planet."
      />

      <section className="panel panel--paper section">
        <div className="wrap">
          <div className="grid-3">
            {csr.map((c, i) => (
              <article className="paper-card paper-card--pad" key={c.title} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <span className="medal">
                  <Icon name={icons[i]} />
                </span>
                <p className="small gold" style={{ fontWeight: 600, marginTop: 6 }}>
                  {c.kind}
                </p>
                <h2 className="h3">{c.title}</h2>
                <p className="muted">{c.text}</p>
                <p className="small" style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid rgba(14,27,54,.1)' }}>
                  <WithPlaceholders text={c.measure} />
                </p>
              </article>
            ))}
          </div>
          <div className="metal-plate vm" style={{ borderRadius: 'var(--r-card)', marginTop: 16, minHeight: 0 }}>
            <span className="vm__label" style={{ color: '#4a3410' }}>
              Annual impact note
            </span>
            <p style={{ color: '#2a1d05', fontSize: 19, maxWidth: '64ch' }}>
              Once a year we publish a short, honest account of what we did and what it achieved, with the same rules as the rest of this site: real numbers or none.
            </p>
            <p style={{ color: '#3d2c0c' }}>
              First edition: <WithPlaceholders text="[YEAR]" />
            </p>
          </div>
        </div>
      </section>

      <CtaPanel title="A school, NGO or agency that wants to work with us?" text="We are glad to share time, skills and tools where they help." primary={{ label: 'Get in touch', href: '/contact/' }} />
    </>
  );
}
