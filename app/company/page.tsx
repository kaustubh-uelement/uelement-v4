import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel, Chip } from '@/components/ui';
import { founders, timeline, partners } from '@/lib/content';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About us',
  description: 'UElement Technologies is a DeepTech company from Wakad, Pune, founded by four engineers and operators.',
  alternates: { canonical: '/company/' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Company' }]}
        chip="About UElement"
        chipIcon="people"
        title="Not just a company. An aggregation of thoughts."
        lede="UElement is a shared mindset and one common goal we all want to walk towards. Anything once in ruins can be rebuilt. It starts with mindset."
      >
        <Link className="btn btn--metal" href="/company/mission/">
          Read our mission
        </Link>
        <Link className="btn btn--glass" href="/company/careers/">
          Join us
        </Link>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(32px, 5vw, 80px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
            <Chip icon="compass">Our story</Chip>
            <h2 className="h2">Built by people who have built before.</h2>
            <div className="prose muted" style={{ fontSize: 18 }}>
              <p>
                Some of the loudest visions of the future treat Earth as a place to leave behind. We disagree. The talent, capital and intelligence the world is
                building now are enough to repair what we have, if we choose to point them there.
              </p>
              <p>
                {company.name} is based in Wakad, Pune, and works with customers globally. We build quantum-safe security, a unified enterprise data plane and
                sovereign edge AI, and we provide the services around them.
              </p>
            </div>
          </div>
          <ol className="timeline">
            {timeline.map((t) => (
              <li key={t.year}>
                <span className="year">{t.year}</span>
                <p>{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Founders" chipIcon="people" title="Four founders, one common goal." />
          <div className="grid-4">
            {founders.map((f) => (
              <article className="glass-card glass-card--pad" key={f.name} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <span className="medal medal--lg">{f.initials}</span>
                <h3 className="h3" style={{ marginTop: 6 }}>
                  {f.name}
                </h3>
                <p className="gold small" style={{ fontWeight: 560 }}>
                  {f.role}
                </p>
                <p className="muted small">{f.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <SectionHead chip="Partners" chipIcon="handshake" title="Who we work with" />
          <div className="grid-3">
            {partners.map((p) => (
              <div className="paper-card paper-card--pad" key={p.name} style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 className="h3">{p.name}</h3>
                <p className="gold small" style={{ fontWeight: 560 }}>
                  {p.area}
                </p>
                <p className="muted small">{p.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link className="btn btn--ink" href="/partnerships/">
              Partner with us
            </Link>
          </div>
        </div>
      </section>

      <section className="panel panel--paper section--tight">
        <div className="wrap">
          <dl className="kv">
            <div>
              <dt>Registered name</dt>
              <dd>{company.name}</dd>
            </div>
            <div>
              <dt>CIN</dt>
              <dd>{company.cin}</dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd>{company.address}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                <a className="text-link" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
                , {company.phone}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <CtaPanel />
    </>
  );
}
