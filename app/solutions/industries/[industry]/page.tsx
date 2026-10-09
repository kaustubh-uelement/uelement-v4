import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, CtaPanel, ArrowLink } from '@/components/ui';
import { ProductLinks, IndustryCard } from '@/components/blocks';
import { industries, findIndustry, solutionAreas } from '@/lib/content';

export function generateStaticParams() {
  return industries.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const i = findIndustry(industry);
  if (!i) return {};
  return { title: `${i.name} solutions`, description: i.summary, alternates: { canonical: `/solutions/industries/${i.slug}/` } };
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const i = findIndustry(industry);
  if (!i) notFound();
  const areas = solutionAreas.filter((a) => i.areas.includes(a.slug));
  const idx = industries.findIndex((x) => x.slug === i.slug);
  const more = [1, 2, 3].map((k) => industries[(idx + k) % industries.length]);

  return (
    <>
      <PageHero crumbs={[{ label: 'Solutions', href: '/solutions/' }, { label: 'Industries', href: '/solutions/industries/' }, { label: i.name }]} chip={i.name} chipIcon="globe" title={i.summary}>
        <Link className="btn btn--metal" href="/contact/">
          Talk to us
        </Link>
        <a className="btn btn--glass" href="#needs">
          What it needs
        </a>
      </PageHero>

      <section className="panel panel--paper section" id="needs">
        <div className="wrap">
          <SectionHead chip="What it needs" chipIcon="compass" title={`What ${i.name} needs most`} />
          <div className="grid-3">
            {i.needs.map((n) => (
              <div className="paper-card paper-card--pad" key={n} style={{ display: 'grid', gap: 14 }}>
                <span className="medal">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                </span>
                <p className="h3">{n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <SectionHead chip="How we help" chipIcon="cube" title="Products that help" />
          <ProductLinks slugs={i.products} />
          <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: '12px 28px' }}>
            {areas.map((a) => (
              <ArrowLink key={a.slug} href={`/solutions/${a.slug}/`}>
                {a.name}
              </ArrowLink>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section--tight">
        <div className="wrap">
          <SectionHead chip="More industries" chipIcon="globe" title="Other industries we serve" />
          <div className="grid-3">
            {more.map((m) => (
              <IndustryCard key={m.slug} industry={m} tone="glass" />
            ))}
          </div>
        </div>
      </section>

      <CtaPanel />
    </>
  );
}
