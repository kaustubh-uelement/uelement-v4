import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { nav } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Company information, partnerships, the resource center and support, in one place.',
  alternates: { canonical: '/resources/' },
};

export default function ResourcesPage() {
  const groups = nav.find((m) => m.label === 'Resources')!.groups;
  return (
    <>
      <PageHero crumbs={[{ label: 'Resources' }]} chip="Resources" chipIcon="book" title="Everything else you might be looking for." lede="Who we are, how to partner with us, what we have published and how to get help." />
      <section className="panel panel--paper section">
        <div className="wrap grid-2" style={{ ['--gap' as string]: '16px' } as React.CSSProperties}>
          {groups.map((g) => (
            <div className="paper-card paper-card--pad" key={g.title} style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
              <h2 className="h3">
                {g.href ? (
                  <Link href={g.href} className="text-link" style={{ color: 'var(--ink)' }}>
                    {g.title}
                    <Icon name="arrow" />
                  </Link>
                ) : (
                  g.title
                )}
              </h2>
              <ul style={{ listStyle: 'none', display: 'grid' }}>
                {g.links.map((l) => (
                  <li key={l.href + l.label} style={{ borderTop: '1px solid rgba(14,27,54,.08)' }}>
                    <Link href={l.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                      <span>{l.label}</span>
                      <Icon name="arrow" className="gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
