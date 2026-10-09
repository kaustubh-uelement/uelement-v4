import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/ui';
import { EmptyState } from '@/components/blocks';
import { resourceSections, founders } from '@/lib/content';
import { company } from '@/lib/site';

export function generateStaticParams() {
  return resourceSections.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const s = resourceSections.find((x) => x.slug === section);
  if (!s) return {};
  return { title: s.name, description: s.lede, alternates: { canonical: `/resources/${s.slug}/` } };
}

export default async function ResourceSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = resourceSections.find((x) => x.slug === section);
  if (!s) notFound();
  const others = resourceSections.filter((x) => x.slug !== s.slug);
  return (
    <>
      <PageHero crumbs={[{ label: 'Resources', href: '/resources/' }, { label: s.name }]} chip={s.name} chipIcon={s.icon} title={s.title} lede={s.lede} />

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 16 }}>
          <EmptyState
            icon={s.icon}
            title={`Nothing published in ${s.name.toLowerCase()} yet`}
            text={s.empty}
            actions={
              <Link className="btn btn--ink" href={s.action.href}>
                {s.action.label}
              </Link>
            }
          />

          {s.slug === 'newsroom' ? (
            <div className="paper-card paper-card--pad" style={{ display: 'grid', gap: 18 }}>
              <h2 className="h3">Company facts</h2>
              <dl className="kv">
                <div>
                  <dt>About UElement</dt>
                  <dd>
                    {company.name} is a DeepTech company from Wakad, Pune, India. It builds quantum-safe security (U92 Quantum), a unified enterprise data
                    plane (U92 Enterprise) and sovereign edge AI (U92 Deeptech), and works with customers globally.
                  </dd>
                </div>
                <div>
                  <dt>Founders</dt>
                  <dd>{founders.map((f) => `${f.name}, ${f.role}`).join('; ')}</dd>
                </div>
                <div>
                  <dt>Headquarters</dt>
                  <dd>{company.address}</dd>
                </div>
                <div>
                  <dt>CIN</dt>
                  <dd>{company.cin}</dd>
                </div>
                <div>
                  <dt>Press contact</dt>
                  <dd>
                    <a className="text-link" href={`mailto:${company.email}?subject=Press%20enquiry`}>
                      {company.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel panel--enamel section--tight">
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span className="muted" style={{ marginRight: 8 }}>
            More in the resource center
          </span>
          {others.map((o) => (
            <Link key={o.slug} href={`/resources/${o.slug}/`} className="chip chip--plain">
              {o.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
