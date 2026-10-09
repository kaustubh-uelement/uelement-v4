import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, WithPlaceholders } from '@/components/ui';
import { recognition } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Industry Recognition',
  description: 'Awards, programmes and media coverage of UElement’s work.',
  alternates: { canonical: '/why-uelement/recognition/' },
};

function Group({ title, items }: { title: string; items: { title: string; meta: string; date?: string }[] }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <h2 className="h3">{title}</h2>
      <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
        {items.map((it, i) => (
          <li key={i} className="paper-card" style={{ padding: '20px 24px', display: 'grid', gap: 4 }}>
            <span className="h4">
              <WithPlaceholders text={it.title} />
            </span>
            <span className="muted small">
              <WithPlaceholders text={it.meta + (it.date ? `, ${it.date}` : '')} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RecognitionPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Why UElement', href: '/why-uelement/' }, { label: 'Industry Recognition' }]} chip="Industry Recognition" chipIcon="spark" title="Recognition for our work." lede="Awards, programmes and coverage, each with a link to the original source." />
      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', alignItems: 'start' }}>
          <Group title="Awards" items={recognition.awards} />
          <Group title="Programmes and memberships" items={recognition.programmes} />
          <Group title="In the media" items={recognition.media} />
        </div>
      </section>
      <section className="panel panel--enamel section--tight">
        <div className="wrap" style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
          <h2 className="h2">Writing about UElement?</h2>
          <p className="lede muted">Our newsroom has company facts, founder bios and a press contact.</p>
          <Link className="btn btn--metal" href="/resources/newsroom/">
            Visit the newsroom
          </Link>
        </div>
      </section>
    </>
  );
}
