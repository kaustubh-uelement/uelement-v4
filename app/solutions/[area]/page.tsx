import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { ProductLinks } from '@/components/blocks';
import { Icon } from '@/components/Icon';
import { solutionAreas, findIndustry, services } from '@/lib/content';

export function generateStaticParams() {
  return solutionAreas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const a = solutionAreas.find((x) => x.slug === area);
  if (!a) return {};
  return { title: a.name, description: a.summary, alternates: { canonical: `/solutions/${a.slug}/` } };
}

const serviceFor: Record<string, string[]> = {
  'business-transformation': ['business-transformation', 'saas-engineering', 'ai-applications', 'mvp-prototyping'],
  'enterprise-security': ['enterprise-security', 'quantum-applications', 'infrastructure', 'telecom-satcom'],
  'edge-ai': ['edge-ai-advisory', 'ai-applications', 'telecom-satcom'],
};

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const a = solutionAreas.find((x) => x.slug === area);
  if (!a) notFound();
  const inds = a.industries.map(findIndustry).filter(Boolean) as NonNullable<ReturnType<typeof findIndustry>>[];
  const svc = services.filter((s) => serviceFor[a.slug]?.includes(s.slug));

  return (
    <>
      <PageHero crumbs={[{ label: 'Solutions', href: '/solutions/' }, { label: a.name }]} chip={a.name} chipIcon="compass" title={a.promise} lede={a.summary}>
        <Link className="btn btn--metal" href={a.slug === 'edge-ai' ? '/partnerships/technology-alliance/' : '/contact/'}>
          {a.slug === 'edge-ai' ? 'Become a design partner' : 'Talk to us'}
        </Link>
        <a className="btn btn--glass" href="#outcomes">
          What changes
        </a>
      </PageHero>

      <section className="panel panel--paper section" id="outcomes">
        <div className="wrap">
          <SectionHead chip="Outcomes" chipIcon="star" title="What changes for you" />
          <div className="grid-3">
            {a.outcomes.map((o) => (
              <div className="paper-card paper-card--pad" key={o.title} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <span className="medal">
                  <Icon name="spark" />
                </span>
                <h3 className="h3">{o.title}</h3>
                <p className="muted">{o.text}</p>
              </div>
            ))}
          </div>
          {a.maturity ? (
            <div className="glass-card glass-card--pad" style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <Icon name="compass" className="gold" />
              <p>{a.maturity}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <SectionHead chip="Products" chipIcon="cube" title="Products that deliver it" />
          <ProductLinks slugs={a.products} />
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(32px, 5vw, 72px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', alignItems: 'start' }}>
          <div>
            <SectionHead chip="Industries" chipIcon="globe" title={`Where ${a.name.toLowerCase()} matters most`} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {inds.map((i) => (
                <Link key={i.slug} href={`/solutions/industries/${i.slug}/`} className="chip chip--plain">
                  {i.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHead chip="Services" chipIcon="handshake" title="Services that help" />
            <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
              {svc.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}/`} className="glass-card card-link" style={{ padding: '18px 22px', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <span style={{ flex: 1, display: 'grid', gap: 2 }}>
                      <span className="h4">{s.name}</span>
                      <span className="muted small">{s.summary}</span>
                    </span>
                    <Icon name="arrow" className="gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaPanel />
    </>
  );
}
