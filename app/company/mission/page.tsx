import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { beliefs, commitments, decisionFilter } from '@/lib/content';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Our mission',
  description: 'Build frontier technology that earns its place by leaving people and the planet better off, not just the balance sheet.',
  alternates: { canonical: '/company/mission/' },
};

const icons: IconName[] = ['shield', 'eye', 'leaf', 'people', 'star'];

export default function MissionPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Company', href: '/company/' }, { label: 'Our mission' }]} chip={company.statement} chipIcon="compass" title="Technology that leaves people and the planet better off." />

      <section className="panel panel--paper section">
        <div className="wrap vm-grid">
          <article className="paper-card vm">
            <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>
              Our vision
            </span>
            <p className="statement" style={{ fontSize: 'clamp(30px, 3.4vw, 46px)' }}>
              A future where humanity and technology progress together, and the planet grows healthier because of both.
            </p>
            <p className="muted">A future with no need for the words “global warming”, and no apocalyptic ending.</p>
          </article>
          <article className="metal-plate vm" style={{ borderRadius: 'var(--r-card)' }}>
            <span className="vm__label" style={{ color: '#4a3410' }}>
              Our mission
            </span>
            <p className="statement" style={{ fontSize: 'clamp(30px, 3.4vw, 46px)', color: '#2a1d05' }}>
              Build frontier technology that earns its place by leaving people and the planet better off, not just the balance sheet.
            </p>
          </article>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Our commitments" chipIcon="star" title="Five commitments we will measure ourselves by." />
          <ul className="commit-list">
            {commitments.map((c, i) => (
              <li className="glass-card commit" key={c.title}>
                <span className="medal medal--lg">
                  <Icon name={icons[i]} />
                </span>
                <h3 className="h3">{c.title}</h3>
                <p className="muted">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <SectionHead chip="What we believe" chipIcon="bulb" title="We repair. We do not plan an exit." />
          <div className="belief-list">
            {beliefs.map((b) => (
              <div className="belief" key={b.title}>
                <h3 className="h3">{b.title}</h3>
                <p className="muted">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="How we decide" chipIcon="compass" title="Five questions before we say yes." text="Every product, customer and partnership has to pass them." />
          <ol className="steps">
            {decisionFilter.map((d, i) => (
              <li className="paper-card" key={d.title}>
                <span className="medal">{i + 1}</span>
                <h3 className="h3">{d.title}</h3>
                <p className="muted small">{d.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaPanel title="Want to build this with us?" text="We hire people who are brainy and by heart." primary={{ label: 'See careers', href: '/company/careers/' }} secondary={{ label: 'Talk to us', href: '/contact/' }} />
    </>
  );
}
