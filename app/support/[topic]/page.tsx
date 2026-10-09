import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/ui';
import { EmptyState, FormSection } from '@/components/blocks';
import { Faq } from '@/components/Faq';
import { supportTopics, platforms, faqs } from '@/lib/content';
import { company } from '@/lib/site';

export function generateStaticParams() {
  return supportTopics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const t = supportTopics.find((x) => x.slug === topic);
  if (!t) return {};
  return { title: t.name, description: t.lede, alternates: { canonical: `/support/${t.slug}/` } };
}

const severity = [
  { title: 'Service is down', text: 'Call us as well as sending the form, so we can start straight away.' },
  { title: 'A major feature is not working', text: 'Send the form with screenshots or logs if you have them.' },
  { title: 'A question', text: 'The FAQs and guides may answer it faster.' },
];

export default async function SupportTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = supportTopics.find((x) => x.slug === topic);
  if (!t) notFound();
  const crumbs = [{ label: 'Support & Services', href: '/support/' }, { label: t.name }];

  if (t.kind === 'info') {
    return (
      <>
        <PageHero crumbs={crumbs} chip={t.name} chipIcon={t.icon} title={t.title} lede={t.lede} />
        <section className="panel panel--paper section">
          <div className="wrap" style={{ display: 'grid', gap: 40 }}>
            <EmptyState
              icon={t.icon}
              title={t.slug === 'user-guides' ? 'Guides come with your deployment' : 'The public knowledge base is being written'}
              text={
                t.slug === 'user-guides'
                  ? 'Each customer receives the guides for the products they run, kept up to date in the customer portal. If you need a guide now, ask support.'
                  : 'Until it is published, the questions below cover what we are asked most, and support can answer the rest.'
              }
              actions={
                <>
                  <Link className="btn btn--ink" href="/support/get-support/">
                    Ask support
                  </Link>
                  <Link className="btn btn--line" href="/support/customer-portal/">
                    Customer portal
                  </Link>
                </>
              }
            />
            {t.slug === 'user-guides' ? (
              <div className="grid-3">
                {platforms.map((p) => (
                  <div className="paper-card paper-card--pad" key={p.slug} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                    <h2 className="h3">{p.name}</h2>
                    <ul className="list-check small">
                      {p.products.map((x) => (
                        <li key={x.slug}>
                          <Link href={`/platforms/${p.slug}/${x.slug}/`}>{x.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <Faq items={faqs} />
            )}
          </div>
        </section>
      </>
    );
  }

  if (t.kind === 'portal') {
    return (
      <>
        <PageHero crumbs={crumbs} chip={t.name} chipIcon={t.icon} title={t.title} lede={t.lede} />
        <FormSection
          kind="portal"
          chip="Access"
          title="Request portal access."
          text="Portal accounts are set up for each customer organisation. Ask for access here, or ask your UElement contact."
        />
      </>
    );
  }

  return (
    <>
      <PageHero crumbs={crumbs} chip={t.name} chipIcon={t.icon} title={t.title} lede={t.lede}>
        <a className="btn btn--metal" href="#form">
          {t.kind === 'support' ? 'Describe the problem' : t.kind === 'demo' ? 'Request a demo' : t.kind === 'quote' ? 'Request a quote' : 'Send a suggestion'}
        </a>
        {t.kind === 'support' ? (
          <a className="btn btn--glass" href={`tel:${company.phoneHref}`}>
            Call {company.phone}
          </a>
        ) : null}
      </PageHero>

      {t.kind === 'support' ? (
        <section className="panel panel--enamel section--tight">
          <div className="wrap grid-3">
            {severity.map((s) => (
              <div className="glass-card glass-card--pad" key={s.title} style={{ display: 'grid', gap: 8 }}>
                <h2 className="h3">{s.title}</h2>
                <p className="muted small">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <FormSection kind={t.kind} chip={t.name} title={t.kind === 'support' ? 'Tell us what happened.' : t.kind === 'demo' ? 'Book your demo.' : t.kind === 'quote' ? 'Describe the work.' : 'Share your idea.'} />
    </>
  );
}
