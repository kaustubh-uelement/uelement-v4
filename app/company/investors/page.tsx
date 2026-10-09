import type { Metadata } from 'next';
import { PageHero, SectionHead } from '@/components/ui';
import { FormSection } from '@/components/blocks';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Investor relations',
  description: 'Investor enquiries for UElement Technologies Private Limited.',
  alternates: { canonical: '/company/investors/' },
};

const points = [
  { title: 'Three platforms', text: 'Quantum-safe security, a unified enterprise data plane and sovereign edge AI, each with an honest maturity label.' },
  { title: 'Revenue first', text: 'Nexus is live with paying customers. Research products are labelled as research, and profit funds the purpose.' },
  { title: 'Founders who have shipped', text: 'Two earlier startups acquired, and decades at VMware, BMC, Ericsson and PepsiCo.' },
];

export default function InvestorsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Company', href: '/company/' }, { label: 'Investor relations' }]} chip="Investor relations" chipIcon="compass" title="Patient capital for the systems that cannot fail." lede={`${company.name} is a privately held company. We share our investor deck on request.`}>
        <a className="btn btn--metal" href="#form">
          Request the investor deck
        </a>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="At a glance" chipIcon="spark" title="What you would be backing" />
          <div className="grid-3">
            {points.map((p) => (
              <div className="paper-card paper-card--pad" key={p.title} style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 className="h3">{p.title}</h3>
                <p className="muted">{p.text}</p>
              </div>
            ))}
          </div>
          <dl className="kv" style={{ marginTop: 40 }}>
            <div>
              <dt>Registered name</dt>
              <dd>{company.name}</dd>
            </div>
            <div>
              <dt>CIN</dt>
              <dd>{company.cin}</dd>
            </div>
            <div>
              <dt>Registered office</dt>
              <dd>{company.address}</dd>
            </div>
          </dl>
        </div>
      </section>

      <FormSection kind="investor" chip="Investor enquiries" title="Talk to the founders." text="Tell us about your fund or your interest, and we will send the deck and arrange a call." />
    </>
  );
}
