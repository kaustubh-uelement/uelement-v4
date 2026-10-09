import type { Metadata } from 'next';
import { PageHero, CtaPanel } from '@/components/ui';
import { IndustryCard } from '@/components/blocks';
import { industries } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Industries',
  description: 'The eighteen industries UElement serves, from banking and government to agriculture and the environment.',
  alternates: { canonical: '/solutions/industries/' },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Solutions', href: '/solutions/' }, { label: 'Industries' }]}
        chip="Eighteen industries"
        chipIcon="globe"
        title="Built for the industries that hold everything else up."
        lede="Finance, government, energy, health and the networks between them. Pick yours to see what it needs most and how we help."
      />
      <section className="panel panel--paper section">
        <div className="wrap">
          <div className="grid-3">
            {industries.map((i) => (
              <IndustryCard key={i.slug} industry={i} />
            ))}
          </div>
        </div>
      </section>
      <CtaPanel title="Don’t see your industry?" text="Tell us what you run and what cannot fail. We will tell you honestly whether we can help." />
    </>
  );
}
