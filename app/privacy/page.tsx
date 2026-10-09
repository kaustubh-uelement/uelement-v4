import type { Metadata } from 'next';
import { PageHero } from '@/components/ui';
import { company } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy/' } };

// Draft for review by UElement's legal adviser before publishing.
export default function PrivacyPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Privacy' }]} title="Privacy notice" lede="How we handle the personal data you share with us through this website." art={false} />
      <section className="panel panel--paper section">
        <div className="wrap wrap--narrow prose" style={{ display: 'grid', gap: 18, fontSize: 17.5 }}>
          <p className="placeholder" style={{ justifySelf: 'start' }}>Draft: review with legal counsel before launch</p>
          <h2 className="h3">Who we are</h2>
          <p>{company.name} ({company.cin}), {company.address}, is responsible for personal data collected through this website.</p>
          <h2 className="h3">What we collect</h2>
          <p>Only what you choose to send us through our forms or by email: usually your name, email address, organisation, phone number and your message.</p>
          <h2 className="h3">Why we use it</h2>
          <p>To reply to you, to provide the demo, quote, support or partnership you asked about, and to keep a record of our conversation. We do not sell your data.</p>
          <h2 className="h3">How long we keep it</h2>
          <p>For as long as we need it for those purposes, or as the law requires.</p>
          <h2 className="h3">Your rights</h2>
          <p>Under India’s Digital Personal Data Protection Act, 2023, you can ask to access, correct or erase your data, and withdraw consent. Write to {company.email}.</p>
        </div>
      </section>
    </>
  );
}
