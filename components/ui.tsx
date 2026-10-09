import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { statusTone, type Status } from '@/lib/content';
import { DotDome } from './DotDome';

export function Chip({ icon = 'spark', children, plain }: { icon?: IconName; children: ReactNode; plain?: boolean }) {
  return (
    <span className={plain ? 'chip chip--plain' : 'chip'}>
      {plain ? null : (
        <span className="chip__icon">
          <Icon name={icon} />
        </span>
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status status--${statusTone[status]}`}>{status}</span>;
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`logo ${className}`.trim()} aria-label="UElement home">
      <img
        src="/logo.png"
        alt="UElement"
        className="logo__img"
        width={136}
        height={20}
        loading="eager"
      />
    </Link>
  );
}

export type Crumb = { label: string; href?: string };

export function PageHero({
  crumbs,
  chip,
  chipIcon,
  title,
  lede,
  children,
  meta,
  art = true,
}: {
  crumbs?: Crumb[];
  chip?: string;
  chipIcon?: IconName;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  meta?: ReactNode;
  art?: boolean;
}) {
  return (
    <section className="panel panel--enamel page-hero">
      {art ? (
        <div className="page-hero__art" aria-hidden="true">
          <DotDome />
        </div>
      ) : null}
      <div className="wrap page-hero__inner">
        {crumbs && crumbs.length ? (
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/">Home</Link>
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <span aria-hidden="true">/</span>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        {chip ? (
          <div>
            <Chip icon={chipIcon}>{chip}</Chip>
          </div>
        ) : null}
        <h1 className="h1">{title}</h1>
        {meta ? <div className="page-hero__meta">{meta}</div> : null}
        {lede ? <p className="lede muted">{lede}</p> : null}
        {children ? <div className="actions" style={{ marginTop: 8 }}>{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionHead({
  chip,
  chipIcon,
  title,
  text,
  center,
  split,
  as = 'h2',
}: {
  chip?: string;
  chipIcon?: IconName;
  title: ReactNode;
  text?: ReactNode;
  center?: boolean;
  split?: boolean;
  as?: 'h2' | 'h3';
}) {
  const H = as;
  const cls = ['section-head', center ? 'section-head--center' : '', split ? 'section-head--split' : ''].join(' ');
  if (split) {
    return (
      <div className={cls}>
        <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
          {chip ? <Chip icon={chipIcon}>{chip}</Chip> : null}
          <H className="h2">{title}</H>
        </div>
        {text ? <p className="lede muted">{text}</p> : null}
      </div>
    );
  }
  return (
    <div className={cls}>
      {chip ? (
        <div>
          <Chip icon={chipIcon}>{chip}</Chip>
        </div>
      ) : null}
      <H className="h2">{title}</H>
      {text ? <p className="lede muted" style={center ? { marginInline: 'auto' } : undefined}>{text}</p> : null}
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-link">
      {children}
      <Icon name="arrow" />
    </Link>
  );
}

// The closing invitation used at the foot of most pages.
export function CtaPanel({
  title = 'Building something that cannot fail?',
  text = 'Tell us what you are working on. We will suggest a small, fixed-scope first step.',
  primary = { label: 'Talk to us', href: '/contact/' },
  secondary,
}: {
  title?: string;
  text?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="panel panel--creme section--tight">
      <div className="wrap" style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'end' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <h2 className="h2">{title}</h2>
          <p className="lede muted">{text}</p>
        </div>
        <div className="actions" style={{ justifyContent: 'flex-end' }}>
          {secondary ? (
            <Link className="btn btn--line" href={secondary.href}>
              {secondary.label}
            </Link>
          ) : null}
          <Link className="btn btn--ink" href={primary.href}>
            {primary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="placeholder">{children}</span>;
}

// Renders text, turning [BRACKETED PLACEHOLDERS] into visible placeholder marks.
export function WithPlaceholders({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith('[') && p.endsWith(']') ? <Placeholder key={i}>{p}</Placeholder> : <span key={i}>{p}</span>))}
    </>
  );
}
