import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { services } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Nine services from the team behind U92 Quantum, Nexus and Vizor, each starting with a fixed-scope first step.',
  alternates: { canonical: '/services/' },
};

const icons: Record<string, IconName> = {
  'enterprise-security': 'shield',
  'business-transformation': 'layers',
  infrastructure: 'cube',
  'edge-ai-advisory': 'compass',
  'quantum-applications': 'atom',
  'saas-engineering': 'cube',
  'ai-applications': 'spark',
  'telecom-satcom': 'globe',
  'mvp-prototyping': 'bulb',
};

const steps = [
  { title: 'Scope', text: 'A short call to understand the problem and agree a fixed-scope first step.' },
  { title: 'Prove', text: 'We deliver that first step with agreed measures, usually in weeks.' },
  { title: 'Decide', text: 'You review the results and decide whether to go further.' },
  { title: 'Scale', text: 'We expand in stages, with the same measures and an honest report at each one.' },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services' }]}
        chip="Nine services"
        chipIcon="handshake"
        title="Engineering and advice from the people who build the products."
        lede="Every service starts with a small, fixed-scope step, so you can judge the work before you commit to more."
      >
        <Link className="btn btn--metal" href="/support/service-quote/">
          Get a service quote
        </Link>
        <a className="btn btn--glass" href="#how">
          How we work
        </a>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap">
          <div className="grid-3">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}/`} className="paper-card paper-card--pad card-link">
                <span className="medal">
                  <Icon name={icons[s.slug] ?? 'spark'} />
                </span>
                <h2 className="h3" style={{ marginTop: 6 }}>
                  {s.name}
                </h2>
                <p className="muted small">{s.summary}</p>
                <p className="small" style={{ color: 'var(--gold-ink)', fontWeight: 560 }}>
                  First step: {s.start}
                </p>
                <span className="card-foot text-link">
                  Read more
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section" id="how">
        <div className="wrap">
          <SectionHead chip="How we work" chipIcon="compass" title="Small steps, measured honestly." />
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

      <CtaPanel title="Have a project in mind?" text="Tell us what you need and when. We will reply with a scoped first step and a quote." primary={{ label: 'Get a service quote', href: '/support/service-quote/' }} secondary={{ label: 'Talk to us', href: '/contact/' }} />
    </>
  );
}
