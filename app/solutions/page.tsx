import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel, Chip } from '@/components/ui';
import { IndustryCard } from '@/components/blocks';
import { Icon, type IconName } from '@/components/Icon';
import { solutionAreas, industries } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Business transformation, enterprise security and edge AI for eighteen industries.',
  alternates: { canonical: '/solutions/' },
};

const areaIcons: Record<string, IconName> = {
  'business-transformation': 'layers',
  'enterprise-security': 'shield',
  'edge-ai': 'mesh',
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Solutions' }]}
        chip="Three needs, eighteen industries"
        chipIcon="compass"
        title="Start from the problem, not the product."
        lede="Choose what you need to change, or start from your industry. Either way, we will point you to the smallest useful first step."
      >
        <a className="btn btn--metal" href="#needs">
          By need
        </a>
        <a className="btn btn--glass" href="#industries">
          By industry
        </a>
      </PageHero>

      <section className="panel panel--paper section" id="needs">
        <div className="wrap">
          <SectionHead chip="By need" chipIcon="compass" title="What do you need to change?" />
          <div className="grid-3">
            {solutionAreas.map((a) => (
              <Link key={a.slug} href={`/solutions/${a.slug}/`} className="paper-card paper-card--pad card-link">
                <span className="medal medal--lg">
                  <Icon name={areaIcons[a.slug]} />
                </span>
                <h3 className="h3" style={{ marginTop: 8 }}>
                  {a.name}
                </h3>
                <p className="muted">{a.summary}</p>
                <ul className="list-check small" style={{ marginTop: 6 }}>
                  {a.outcomes.map((o) => (
                    <li key={o.title}>{o.title}</li>
                  ))}
                </ul>
                <span className="card-foot text-link">
                  Explore {a.name}
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section" id="industries">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="globe">By industry</Chip>
              <h2 className="h2">Eighteen industries we serve.</h2>
            </div>
            <p className="lede muted">Each page lists what that industry needs most and which of our products and services help.</p>
          </div>
          <div className="grid-3">
            {industries.map((i) => (
              <IndustryCard key={i.slug} industry={i} tone="glass" />
            ))}
          </div>
        </div>
      </section>

      <CtaPanel />
    </>
  );
}
