import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, CtaPanel, ArrowLink } from '@/components/ui';
import { ProductCard, IndustryCard } from '@/components/blocks';
import { platforms, industries } from '@/lib/content';

export function generateStaticParams() {
  return platforms.map((p) => ({ platform: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const p = platforms.find((x) => x.slug === platform);
  if (!p) return {};
  return { title: p.name, description: p.summary, alternates: { canonical: `/platforms/${p.slug}/` } };
}

const whyNow: Record<string, { title: string; text: string }[]> = {
  'u92-quantum': [
    { title: 'The standards are final', text: 'NIST published the first post-quantum standards in August 2024 as FIPS 203, 204 and 205.' },
    { title: 'The deadline is set', text: 'India’s roadmap asks critical infrastructure to be fully quantum-safe by December 2029.' },
    { title: 'The theft is already happening', text: 'Data stolen today can be stored and decrypted once a capable quantum computer exists.' },
  ],
  'u92-enterprise': [
    { title: 'One identity', text: 'Sign in once across Nexus, Vizor and Kayak, with one set of roles and permissions.' },
    { title: 'One data layer', text: 'Every product reads and writes the same data, so nothing is copied between tools.' },
    { title: 'One audit trail', text: 'Every action is recorded once, ready for your auditors and regulators.' },
  ],
  'u92-deeptech': [
    { title: 'Design stage', text: 'Every U92 Deeptech product is at design stage. We say so plainly.' },
    { title: 'Design partners wanted', text: 'We are looking for partners in energy, environment and public infrastructure.' },
    { title: 'Named for Indian science', text: 'KalaMOS, BoSC3 and NobisGRID honour Kalam, the Boses and Mahalanobis.' },
  ],
};

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = platforms.find((x) => x.slug === platform);
  if (!p) notFound();
  const slugs = p.products.map((x) => x.slug);
  const used = industries.filter((i) => i.products.some((s) => slugs.includes(s))).slice(0, 6);

  return (
    <>
      <PageHero crumbs={[{ label: 'Platforms', href: '/platforms/' }, { label: p.name }]} chip={`${p.name}, ${p.short.toLowerCase()}`} chipIcon="layers" title={p.promise} lede={p.summary}>
        <Link className="btn btn--metal" href={p.slug === 'u92-deeptech' ? '/partnerships/technology-alliance/' : '/support/demo/'}>
          {p.slug === 'u92-deeptech' ? 'Become a design partner' : 'Book a demo'}
        </Link>
        <a className="btn btn--glass" href="#products">
          See the products
        </a>
      </PageHero>

      <section className="panel panel--paper section" id="products">
        <div className="wrap">
          <SectionHead chip={p.alias} chipIcon="cube" title={`The ${p.name} products`} text="Each product works on its own and gets stronger alongside the others." />
          <div className="grid-3">
            {p.products.map((x) => (
              <ProductCard key={x.slug} product={x} href={`/platforms/${p.slug}/${x.slug}/`} />
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead
            chip={p.slug === 'u92-quantum' ? 'Why now' : p.slug === 'u92-enterprise' ? 'One data plane' : 'Where we are'}
            chipIcon="compass"
            title={p.slug === 'u92-quantum' ? 'Quantum safety is a this-decade problem.' : p.slug === 'u92-enterprise' ? 'Add the next product without re-platforming.' : 'Research, stated honestly.'}
          />
          <div className="grid-3">
            {whyNow[p.slug]?.map((w) => (
              <div className="glass-card glass-card--pad" key={w.title} style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 className="h3">{w.title}</h3>
                <p className="muted">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {used.length ? (
        <section className="panel panel--creme section">
          <div className="wrap">
            <SectionHead chip="Industries" chipIcon="globe" title={`Where ${p.name} is used`} />
            <div className="grid-3">
              {used.map((i) => (
                <IndustryCard key={i.slug} industry={i} />
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <ArrowLink href="/solutions/industries/">All 18 industries</ArrowLink>
            </div>
          </div>
        </section>
      ) : null}

      <CtaPanel />
    </>
  );
}
