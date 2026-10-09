import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui';
import { FormSection } from '@/components/blocks';
import { Icon } from '@/components/Icon';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact UElement in Wakad, Pune: ${company.email}, ${company.phone}.`,
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Contact' }]} chip="Contact" chipIcon="chat" title="Let’s talk." lede="Building something that cannot fail? We’d like to hear about it." />
      <FormSection
        kind="contact"
        chip="Write to us"
        title="Send us a message."
        text="A project, a partnership, a role or a question. Tell us a little and we will get back to you."
        aside={
          <div className="grid" style={{ ['--gap' as string]: '10px', width: '100%', marginTop: 8 } as React.CSSProperties}>
            <a className="paper-card founder card-link" href={`mailto:${company.email}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="mail" />
              </span>
              <span className="founder__name">{company.email}</span>
            </a>
            <a className="paper-card founder card-link" href={`tel:${company.phoneHref}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="phone" />
              </span>
              <span className="founder__name">{company.phone}</span>
            </a>
            <div className="paper-card founder">
              <span className="medal">
                <Icon name="pin" />
              </span>
              <span className="founder__name">{company.address}</span>
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              Need help with a product? <Link className="text-link" href="/support/get-support/">Get support now</Link>
            </p>
          </div>
        }
      />
    </>
  );
}
