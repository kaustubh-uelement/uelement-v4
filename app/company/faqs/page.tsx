import type { Metadata } from 'next';
import { PageHero, CtaPanel } from '@/components/ui';
import { Faq } from '@/components/Faq';
import { faqs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about UElement, post-quantum cryptography and how engagements start.',
  alternates: { canonical: '/company/faqs/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FaqPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Company', href: '/company/' }, { label: 'FAQs' }]} chip="FAQs" chipIcon="chat" title="Questions we are often asked." />
      <section className="panel panel--paper section">
        <div className="wrap wrap--narrow">
          <Faq items={faqs} />
        </div>
      </section>
      <CtaPanel title="Didn’t find your answer?" text="Ask us directly. A person will reply." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
