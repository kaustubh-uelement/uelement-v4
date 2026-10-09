import Link from 'next/link';
import type { ReactNode } from 'react';
import { ContactForm } from './ContactForm';
import { Icon, type IconName } from './Icon';
import { Chip, StatusBadge } from './ui';
import { company } from '@/lib/site';
import type { FormKind } from '@/lib/forms';
import { findProduct, type Industry, type Product } from '@/lib/content';

export function FormSection({
  kind,
  title,
  text,
  chip = 'Get in touch',
  context,
  aside,
}: {
  kind: FormKind;
  title: string;
  text?: ReactNode;
  chip?: string;
  context?: string;
  aside?: ReactNode;
}) {
  return (
    <section className="panel panel--paper section" id="form">
      <div className="wrap" style={{ display: 'grid', gap: 'clamp(32px, 5vw, 72px)', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
          <Chip icon="chat">{chip}</Chip>
          <h2 className="h2">{title}</h2>
          {text ? <p className="lede muted">{text}</p> : null}
          {aside ?? (
            <ul className="contact-list small" style={{ marginTop: 8 }}>
              <li>
                <Icon name="mail" className="gold" />
                <a className="text-link" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
              </li>
              <li>
                <Icon name="phone" className="gold" />
                <a className="text-link" href={`tel:${company.phoneHref}`}>
                  {company.phone}
                </a>
              </li>
            </ul>
          )}
        </div>
        <div className="paper-card paper-card--pad" style={{ flexBasis: '60%' }}>
          <ContactForm kind={kind} context={context} />
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product, href }: { product: Product; href: string }) {
  return (
    <Link href={href} className="paper-card paper-card--pad card-link">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 className="h3">{product.name}</h3>
        <StatusBadge status={product.status} />
      </div>
      <p style={{ fontWeight: 560, color: 'var(--gold-ink)', fontSize: 15 }}>{product.short}</p>
      <p className="muted small">{product.summary}</p>
      <span className="card-foot text-link">
        Explore {product.name}
        <Icon name="arrow" />
      </span>
    </Link>
  );
}

export function productHref(slug: string) {
  const p = findProduct(slug);
  return p ? `/platforms/${p.platform.slug}/${p.slug}/` : '/platforms/';
}

export function ProductLinks({ slugs }: { slugs: string[] }) {
  return (
    <div className="grid-3">
      {slugs.map((s) => {
        const p = findProduct(s);
        if (!p) return null;
        return <ProductCard key={s} product={p} href={productHref(s)} />;
      })}
    </div>
  );
}

const industryIcons: Record<string, IconName> = {
  bfsi: 'key',
  'capital-markets': 'layers',
  'it-software': 'cube',
  'healthcare-pharma': 'shield',
  'government-psus': 'globe',
  'aerospace-defence': 'compass',
  manufacturing: 'cube',
  'startups-smes': 'spark',
  'satellite-telecom': 'atom',
  'energy-gas': 'bulb',
  'water-public-infra': 'mesh',
  'data-centres': 'layers',
  'retail-ecommerce': 'globe',
  'logistics-supply-chain': 'mesh',
  environment: 'leaf',
  agriculture: 'leaf',
  education: 'book',
  'consulting-services': 'people',
};

export function IndustryCard({ industry, tone = 'paper' }: { industry: Industry; tone?: 'paper' | 'glass' }) {
  return (
    <Link href={`/solutions/industries/${industry.slug}/`} className={`${tone === 'glass' ? 'glass-card glass-card--pad' : 'paper-card paper-card--pad'} card-link`}>
      <span className="medal">
        <Icon name={industryIcons[industry.slug] ?? 'spark'} />
      </span>
      <h3 className="h3" style={{ marginTop: 6 }}>
        {industry.name}
      </h3>
      <p className="muted small">{industry.summary}</p>
      <span className="card-foot text-link">
        Read more
        <Icon name="arrow" />
      </span>
    </Link>
  );
}

// An honest empty state: says what is coming and gives the visitor something to do now.
export function EmptyState({
  icon,
  title,
  text,
  actions,
}: {
  icon: IconName;
  title: string;
  text: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="paper-card empty">
      <span className="medal medal--lg">
        <Icon name={icon} />
      </span>
      <h2 className="h3">{title}</h2>
      <p className="muted" style={{ maxWidth: '60ch' }}>
        {text}
      </p>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
