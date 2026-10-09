import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, WithPlaceholders } from '@/components/ui';
import { research } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Research & Community Contributions',
  description: 'What UElement contributes to standards, research and the wider community, each with a public source.',
  alternates: { canonical: '/why-uelement/research/' },
};

export default function ResearchPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Why UElement', href: '/why-uelement/' }, { label: 'Research & Community' }]}
        chip="Research & Community"
        chipIcon="book"
        title="We share what we learn, in public."
        lede="Quantum security is too important to keep behind closed doors. Here is what we contribute to standards, research and the wider community. Every item links to a public source."
      />

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(40px, 5vw, 64px)' }}>
          {research.map((r) => (
            <div key={r.title} style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <h2 className="h3">{r.title}</h2>
                <p className="muted">{r.text}</p>
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 10, gridColumn: 'span 2' }}>
                {r.items.map((it, i) => (
                  <li key={i} className="paper-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'grid', gap: 4 }}>
                      <span className="h4">
                        <WithPlaceholders text={it.title} />
                      </span>
                      <span className="muted small">
                        <WithPlaceholders text={it.meta} />
                      </span>
                    </span>
                    {it.date ? (
                      <span className="small muted">
                        <WithPlaceholders text={it.date} />
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel--enamel section--tight">
        <div className="wrap" style={{ display: 'grid', gap: 20, justifyItems: 'start', maxWidth: 900 }}>
          <h2 className="h2">Our publishing rule</h2>
          <p className="lede muted">We list only work that is public and checkable. If you are a researcher who wants to collaborate, we would like to hear from you.</p>
          <Link className="btn btn--metal" href="/contact/">
            Collaborate with us
          </Link>
        </div>
      </section>
    </>
  );
}
