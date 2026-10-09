import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { ProductLinks } from '@/components/blocks';
import { services } from '@/lib/content';

export function generateStaticParams() {
  return services.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const s = services.find((x) => x.slug === service);
  if (!s) return {};
  return { title: s.name, description: s.summary, alternates: { canonical: `/services/${s.slug}/` } };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const s = services.find((x) => x.slug === service);
  if (!s) notFound();
  const quote = `/support/service-quote/?service=${encodeURIComponent(s.name)}`;
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHero crumbs={[{ label: 'Services', href: '/services/' }, { label: s.name }]} chip="Service" chipIcon="handshake" title={s.name} lede={s.summary}>
        <Link className="btn btn--metal" href={quote}>
          Get a quote
        </Link>
        <Link className="btn btn--glass" href="/contact/">
          Talk to us
        </Link>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(28px, 4vw, 64px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', alignItems: 'start' }}>
          <div>
            <SectionHead chip="What is included" chipIcon="spark" title="What we do" />
            <ul className="list-check" style={{ fontSize: 18 }}>
              {s.includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {s.via ? (
              <p className="muted small" style={{ marginTop: 20 }}>
                {s.via}
              </p>
            ) : null}
          </div>
          <div className="metal-plate vm" style={{ borderRadius: 'var(--r-card)', minHeight: 0 }}>
            <span className="vm__label" style={{ color: '#4a3410' }}>
              First step
            </span>
            <h2 className="h2" style={{ color: '#2a1d05' }}>
              {s.start}
            </h2>
            <p style={{ color: '#3d2c0c' }}>A fixed scope, agreed measures and a clear decision point at the end.</p>
            <Link className="btn btn--ink" href={quote} style={{ justifySelf: 'start' }}>
              Get a quote
            </Link>
          </div>
        </div>
      </section>

      {s.products.length ? (
        <section className="panel panel--creme section">
          <div className="wrap">
            <SectionHead chip="Built on" chipIcon="cube" title="Products we use" />
            <ProductLinks slugs={s.products} />
          </div>
        </section>
      ) : null}

      <section className="panel panel--enamel section--tight">
        <div className="wrap">
          <SectionHead chip="More services" chipIcon="handshake" title="Other services" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/services/${o.slug}/`} className="chip chip--plain">
                {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaPanel primary={{ label: 'Get a service quote', href: quote }} />
    </>
  );
}
