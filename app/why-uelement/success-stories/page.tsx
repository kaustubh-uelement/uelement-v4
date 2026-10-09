import type { Metadata } from 'next';
import { PageHero, CtaPanel, WithPlaceholders } from '@/components/ui';
import { stories } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Customer Success Stories',
  description: 'Real engagements, shared with our customers’ permission.',
  alternates: { canonical: '/why-uelement/success-stories/' },
};

export default function StoriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Why UElement', href: '/why-uelement/' }, { label: 'Customer Success Stories' }]}
        chip="Customer Success Stories"
        chipIcon="quote"
        title="Real work, shared with permission."
        lede="Every story here is a real engagement, and every result is one our customer has agreed to share."
      />

      <section className="panel panel--paper section">
        <div className="wrap" style={{ display: 'grid', gap: 16 }}>
          {stories.map((s) =>
            s.inProgress ? (
              <article key={s.client} className="glass-card glass-card--pad" style={{ display: 'grid', gap: 12, border: '1px dashed rgba(138,101,34,.4)' }}>
                <span className="status status--dash" style={{ justifySelf: 'start' }}>
                  In progress, {s.tag}
                </span>
                <h2 className="h3">{s.client}</h2>
                <p className="muted">
                  {s.challenge} {s.did}
                </p>
              </article>
            ) : (
              <article key={s.client} className="paper-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', overflow: 'hidden' }}>
                <div className="panel--enamel" style={{ padding: 'clamp(28px, 3vw, 40px)', display: 'grid', gap: 14, alignContent: 'start' }}>
                  <span className="chip chip--plain" style={{ justifySelf: 'start' }}>
                    {s.tag}
                  </span>
                  <h2 className="h2">{s.client}</h2>
                  <p style={{ color: 'var(--mist)' }}>{s.relation}</p>
                </div>
                <div style={{ padding: 'clamp(28px, 3vw, 40px)', gridColumn: 'span 2' }}>
                  <dl className="kv">
                    <div>
                      <dt>The challenge</dt>
                      <dd>{s.challenge}</dd>
                    </div>
                    <div>
                      <dt>What we did</dt>
                      <dd>{s.did}</dd>
                    </div>
                    <div>
                      <dt>The result</dt>
                      <dd>
                        <WithPlaceholders text={s.result} />
                      </dd>
                    </div>
                  </dl>
                  <p className="serif" style={{ fontSize: 24, marginTop: 20, lineHeight: 1.3 }}>
                    <WithPlaceholders text={s.quote} />
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <CtaPanel title="Your story could be next." text="Start small. We will agree what success looks like before we begin." />
    </>
  );
}
