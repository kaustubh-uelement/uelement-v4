import type { Metadata } from 'next';
import { PageHero, SectionHead } from '@/components/ui';
import { EmptyState } from '@/components/blocks';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Work on post-quantum cryptography, enterprise platforms and edge AI at UElement in Wakad, Pune.',
  alternates: { canonical: '/company/careers/' },
};

const what = [
  { title: 'Brainy and by heart', text: 'We look for people with both. Skill matters, and so does how you treat people and the planet.' },
  { title: 'Real work from day one', text: 'Interns and early-career engineers work on post-quantum cryptography, AI and security in production.' },
  { title: 'A path to the top', text: 'One of our co-founders joined as an intern. Ownership is earned here, and it can be earned.' },
];

export default function CareersPage() {
  const mail = `mailto:${company.email}?subject=${encodeURIComponent('Careers at UElement')}`;
  return (
    <>
      <PageHero crumbs={[{ label: 'Company', href: '/company/' }, { label: 'Careers' }]} chip="Careers" chipIcon="people" title="Build frontier technology that leaves things better than you found them." lede="Quantum-safe security, enterprise platforms and edge AI, built from Wakad, Pune, for customers around the world.">
        <a className="btn btn--metal" href={mail}>
          Write to us
        </a>
      </PageHero>

      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="Working here" chipIcon="spark" title="What we look for, and what you get" />
          <div className="grid-3">
            {what.map((w) => (
              <div className="paper-card paper-card--pad" key={w.title} style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <h3 className="h3">{w.title}</h3>
                <p className="muted">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel--creme section">
        <div className="wrap">
          <EmptyState
            icon="people"
            title="Open roles"
            text={`We list roles here when they open. If you would like to work with us before then, write to ${company.email} with a few lines about yourself and something you have built.`}
            actions={
              <a className="btn btn--ink" href={mail}>
                Write to us
              </a>
            }
          />
        </div>
      </section>
    </>
  );
}
