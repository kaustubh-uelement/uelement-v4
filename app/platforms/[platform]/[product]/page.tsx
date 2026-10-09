import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, StatusBadge, CtaPanel } from '@/components/ui';
import { ProductCard } from '@/components/blocks';
import { platforms, industries } from '@/lib/content';
import { Icon } from '@/components/Icon';

export function generateStaticParams() {
  return platforms.flatMap((p) => p.products.map((x) => ({ platform: p.slug, product: x.slug })));
}

function find(platform: string, product: string) {
  const p = platforms.find((x) => x.slug === platform);
  const x = p?.products.find((y) => y.slug === product);
  return p && x ? { p, x } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string; product: string }> }): Promise<Metadata> {
  const { platform, product } = await params;
  const f = find(platform, product);
  if (!f) return {};
  return { title: `${f.x.name}: ${f.x.short}`, description: f.x.summary, alternates: { canonical: `/platforms/${f.p.slug}/${f.x.slug}/` } };
}

export default async function ProductPage({ params }: { params: Promise<{ platform: string; product: string }> }) {
  const { platform, product } = await params;
  const f = find(platform, product);
  if (!f) notFound();
  const { p, x } = f;
  const ready = ['Live', 'Available', 'Pilot'].includes(x.status);
  const others = p.products.filter((y) => y.slug !== x.slug);
  const inds = industries.filter((i) => i.products.includes(x.slug));
  const primary = ready
    ? { label: 'Book a demo', href: `/support/demo/?product=${encodeURIComponent(x.name)}` }
    : { label: x.status === 'Designed' || x.status === 'Research' ? 'Become a design partner' : 'Talk to us', href: x.status === 'Designed' || x.status === 'Research' ? '/partnerships/technology-alliance/' : '/contact/' };

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Platforms', href: '/platforms/' }, { label: p.name, href: `/platforms/${p.slug}/` }, { label: x.name }]}
        title={x.name}
        meta={
          <>
            <StatusBadge status={x.status} />
            <span className="gold" style={{ fontWeight: 560 }}>
              {x.short}
            </span>
          </>
        }
        lede={x.summary}
      >
        <Link className="btn btn--metal" href={primary.href}>
          {primary.label}
        </Link>
        <a className="btn btn--glass" href="#start">
          How to start
        </a>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="What it does" chipIcon="spark" title={`What ${x.name} does for you`} />
          <div className="cap-grid">
            {x.capabilities.map((c) => (
              <div className="paper-card cap" key={c.title}>
                <span className="medal">
                  <Icon name="spark" />
                </span>
                <h3 className="h3" style={{ marginTop: 4 }}>
                  {c.title}
                </h3>
                <p className="muted">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section" id="start">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(28px, 4vw, 64px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <span className="vm__label">Who it is for</span>
            <p className="statement" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
              {x.forWho}
            </p>
            {inds.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {inds.map((i) => (
                  <Link key={i.slug} href={`/solutions/industries/${i.slug}/`} className="chip chip--plain">
                    {i.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="metal-plate vm" style={{ borderRadius: 'var(--r-card)', minHeight: 0 }}>
            <span className="vm__label" style={{ color: '#4a3410' }}>
              How to start
            </span>
            <h2 className="h2" style={{ color: '#2a1d05' }}>
              {x.start.title}
            </h2>
            <p style={{ color: '#3d2c0c', fontSize: 18 }}>{x.start.text}</p>
            <Link className="btn btn--ink" href={primary.href} style={{ justifySelf: 'start' }}>
              {primary.label}
            </Link>
          </div>
        </div>
      </section>

      {others.length ? (
        <section className="panel panel--creme section">
          <div className="wrap">
            <SectionHead chip={p.name} chipIcon="layers" title={`More from ${p.name}`} />
            <div className="grid-3">
              {others.map((y) => (
                <ProductCard key={y.slug} product={y} href={`/platforms/${p.slug}/${y.slug}/`} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaPanel />
    </>
  );
}
