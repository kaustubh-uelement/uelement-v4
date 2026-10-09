import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero, SectionHead } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { supportTopics } from '@/lib/content';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Support & Services',
  description: 'Get support, request a demo or a service quote, and find guides for UElement products.',
  alternates: { canonical: '/support/' },
};

export default function SupportPage() {
  const act = supportTopics.filter((t) => t.kind !== 'info' && t.kind !== 'portal');
  const read = supportTopics.filter((t) => t.kind === 'info' || t.kind === 'portal');
  return (
    <>
      <PageHero crumbs={[{ label: 'Support & Services' }]} chip="Support & Services" chipIcon="lifebuoy" title="How can we help?" lede="Get help with a product, see one working, or ask for a quote.">
        <Link className="btn btn--metal" href="/support/get-support/">
          Get support now
        </Link>
        <a className="btn btn--glass" href={`tel:${company.phoneHref}`}>
          Call {company.phone}
        </a>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="Ask us" chipIcon="chat" title="Start a request" />
          <div className="grid-4">
            {act.map((t) => (
              <Link key={t.slug} href={`/support/${t.slug}/`} className="paper-card paper-card--pad card-link">
                <span className="medal">
                  <Icon name={t.icon} />
                </span>
                <h3 className="h3" style={{ marginTop: 6 }}>
                  {t.name}
                </h3>
                <p className="muted small">{t.lede}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="Find it yourself" chipIcon="book" title="Guides and the customer portal" />
          <div className="grid-3">
            {read.map((t) => (
              <Link key={t.slug} href={`/support/${t.slug}/`} className="glass-card glass-card--pad card-link">
                <span className="medal">
                  <Icon name={t.icon} />
                </span>
                <h3 className="h3" style={{ marginTop: 6 }}>
                  {t.name}
                </h3>
                <p className="muted small">{t.lede}</p>
                <span className="card-foot text-link">
                  Open
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
