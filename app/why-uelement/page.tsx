import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaPanel } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { whyPillars } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Why UElement',
  description: 'Why teams choose UElement: sovereign by design, a small first step, and an honest label on everything we make.',
  alternates: { canonical: '/why-uelement/' },
};

const pages: { icon: IconName; title: string; text: string; href: string; link: string }[] = [
  { icon: 'star', title: 'The UElement Advantage', text: 'Sovereign by design, quantum-ready from day one, one data plane, and founders who have shipped before.', href: '/why-uelement/advantage/', link: 'Read more' },
  { icon: 'quote', title: 'Customer Success Stories', text: 'Real engagements, shared with our customers’ permission.', href: '/why-uelement/success-stories/', link: 'Read the stories' },
  { icon: 'book', title: 'Research & Community', text: 'Standards input, talks, writing and open work, each with a public source.', href: '/why-uelement/research/', link: 'See our contributions' },
  { icon: 'leaf', title: 'Corporate Social Responsibility', text: 'Digital literacy, skilling and an honest account of our own footprint.', href: '/why-uelement/csr/', link: 'See our commitments' },
  { icon: 'spark', title: 'Industry Recognition', text: 'Awards, programmes and coverage of our work.', href: '/why-uelement/recognition/', link: 'View recognition' },
];

export default function WhyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Why UElement' }]}
        chip="Why UElement"
        chipIcon="star"
        title="We earn trust the slow way: by proving it."
        lede="Every engagement starts small and measured. We show you what is live, what is in pilot and what is still being built, and we let our work and our customers speak for us."
      />

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="In three lines" chipIcon="compass" title="What working with us feels like" />
          <div className="grid-3">
            {whyPillars.map((p) => (
              <div className="paper-card paper-card--pad" key={p.title} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <h3 className="statement" style={{ fontSize: 'clamp(28px, 2.6vw, 36px)' }}>
                  {p.title}
                </h3>
                <p className="muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Explore" chipIcon="compass" title="See the evidence for yourself" />
          <div className="grid-3">
            {pages.map((p) => (
              <Link key={p.href} href={p.href} className="glass-card glass-card--pad card-link">
                <span className="medal">
                  <Icon name={p.icon} />
                </span>
                <h3 className="h3" style={{ marginTop: 6 }}>
                  {p.title}
                </h3>
                <p className="muted">{p.text}</p>
                <span className="card-foot text-link">
                  {p.link}
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaPanel title="See it for yourself, at a fixed scope." />
    </>
  );
}
