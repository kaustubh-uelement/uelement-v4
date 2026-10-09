import type { Metadata } from 'next';
import { PageHero } from '@/components/ui';
import { company } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms', alternates: { canonical: '/terms/' } };

// Draft for review by UElement's legal adviser before publishing.
export default function TermsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Terms' }]} title="Website terms of use" art={false} />
      <section className="panel panel--paper section">
        <div className="wrap wrap--narrow prose" style={{ display: 'grid', gap: 18, fontSize: 17.5 }}>
          <p className="placeholder" style={{ justifySelf: 'start' }}>Draft: review with legal counsel before launch</p>
          <p>This website is operated by {company.name}. By using it you agree to these terms.</p>
          <h2 className="h3">Information on this site</h2>
          <p>We work to keep this site accurate. Product maturity labels describe the state of each product when the page was published. Nothing on this site is an offer or a contract; commercial terms are agreed in writing.</p>
          <h2 className="h3">Intellectual property</h2>
          <p>The content, names and marks on this site belong to UElement or its partners. Please ask before reusing them.</p>
          <h2 className="h3">Governing law</h2>
          <p>These terms are governed by the laws of India, and the courts of Pune have jurisdiction.</p>
          <h2 className="h3">Contact</h2>
          <p>{company.email}</p>
        </div>
      </section>
    </>
  );
}
