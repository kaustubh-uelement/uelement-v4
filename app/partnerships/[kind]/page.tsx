import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead } from '@/components/ui';
import { FormSection } from '@/components/blocks';
import { programmes } from '@/lib/content';

export function generateStaticParams() {
  return programmes.map((p) => ({ kind: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> {
  const { kind } = await params;
  const p = programmes.find((x) => x.slug === kind);
  if (!p) return {};
  return { title: p.nav, description: p.summary, alternates: { canonical: `/partnerships/${p.slug}/` } };
}

const steps = [
  { title: 'Apply', text: 'Send the form below with a few lines about your business.' },
  { title: 'Meet', text: 'A call with a founder to see whether there is a fit.' },
  { title: 'Plan', text: 'We agree a joint plan, goals and the first opportunities.' },
  { title: 'Launch', text: 'Training, material and our engineers beside you on the first deal.' },
];

export default async function ProgrammePage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const p = programmes.find((x) => x.slug === kind);
  if (!p) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: 'Partnerships', href: '/partnerships/' }, { label: p.name }]} chip={p.name} chipIcon="handshake" title={p.nav} lede={p.summary}>
        <a className="btn btn--metal" href="#form">
          Apply now
        </a>
        <Link className="btn btn--glass" href="/partnerships/">
          All programmes
        </Link>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(28px, 4vw, 64px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>
              Who it is for
            </span>
            <p className="statement" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
              {p.forWho}
            </p>
          </div>
          <div className="paper-card paper-card--pad" style={{ display: 'grid', gap: 18 }}>
            <h2 className="h3">What we offer</h2>
            <ul className="list-check">
              {p.offer.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <h2 className="h3" style={{ marginTop: 12 }}>
              What we look for
            </h2>
            <ul className="list-check">
              {p.ask.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="How it works" chipIcon="compass" title="From first call to first deal" />
          <ol className="steps">
            {steps.map((s, i) => (
              <li className="glass-card" key={s.title}>
                <span className="medal">{i + 1}</span>
                <h3 className="h3">{s.title}</h3>
                <p className="muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FormSection kind="partner" context={p.name} chip="Apply" title={`Apply for the ${p.name} programme.`} text="Tell us about your business and the customers you serve." />
    </>
  );
}
