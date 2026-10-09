'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nav, company } from '@/lib/site';
import { Icon } from './Icon';
import { Logo } from './ui';

const megaWidth: Record<string, number> = {
  Platforms: 900,
  Solutions: 760,
  Services: 760,
  'Why UElement': 460,
  Resources: 1100,
};

const megaFoot: Record<string, { text: string; label: string; href: string }> = {
  Platforms: { text: 'Every product carries an honest maturity label.', label: 'All platforms', href: '/platforms/' },
  Solutions: { text: 'Eighteen industries, three solution areas.', label: 'All solutions', href: '/solutions/' },
  Services: { text: 'Every engagement starts with a fixed-scope first step.', label: 'All services', href: '/services/' },
  'Why UElement': { text: 'Proof over promises.', label: 'Why UElement', href: '/why-uelement/' },
  Resources: { text: company.email, label: 'Contact us', href: '/contact/' },
};

function sectionOf(path: string) {
  if (path.startsWith('/platforms')) return 'Platforms';
  if (path.startsWith('/solutions')) return 'Solutions';
  if (path.startsWith('/services')) return 'Services';
  if (path.startsWith('/why-uelement')) return 'Why UElement';
  if (/^\/(company|partnerships|resources|support)/.test(path)) return 'Resources';
  return '';
}

export function Header() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverAt = useRef(0);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = sectionOf(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? 'hidden' : '';
  }, [drawer]);

  const close = useCallback((focusTrigger = false) => {
    setOpen((cur) => {
      if (focusTrigger && cur) triggers.current[cur]?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawer) setDrawer(false);
        else close(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.site-header')) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [drawer, close]);

  const hoverOpen = (label: string) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    if (open !== label) hoverAt.current = Date.now();
    setOpen(label);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  };

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="site-header__bar">
          <Logo />

          <nav aria-label="Main" style={{ position: 'relative' }} onPointerLeave={hoverClose}>
            <div className="nav-pills">
              {nav.map((m) => {
                const id = `mega-${m.label.replace(/\W+/g, '-').toLowerCase()}`;
                const isOpen = open === m.label;
                return (
                  <button
                    key={m.label}
                    ref={(el) => { triggers.current[m.label] = el; }}
                    className={`nav-pill${current === m.label ? ' is-current' : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onPointerEnter={hoverOpen(m.label)}
                    onClick={() => {
                      // A mouse click right after hover-open keeps the menu open instead of toggling it shut.
                      if (isOpen && Date.now() - hoverAt.current < 500) return;
                      setOpen(isOpen ? null : m.label);
                    }}
                  >
                    {m.label}
                    <Icon name="chev" />
                  </button>
                );
              })}
              <Link className={`nav-pill${pathname.startsWith('/contact') ? ' is-current' : ''}`} href="/contact/">
                Contact
              </Link>
            </div>

            {nav.map((m) => {
              const id = `mega-${m.label.replace(/\W+/g, '-').toLowerCase()}`;
              const foot = megaFoot[m.label];
              const cols = m.columns ?? m.groups.length;
              return (
                <div
                  key={m.label}
                  id={id}
                  className={`mega${open === m.label ? ' is-open' : ''}`}
                  style={{ ['--mega-w' as string]: `${megaWidth[m.label] ?? 860}px`, ['--cols' as string]: cols } as React.CSSProperties}
                  onPointerEnter={() => window.clearTimeout(closeTimer.current)}
                  aria-hidden={open !== m.label}
                  inert={open !== m.label ? true : undefined}
                >
                  <div className="mega__grid">
                    {m.groups.map((g) => (
                      <div key={g.title}>
                        {g.href ? (
                          <Link className="mega__title" href={g.href}>
                            {g.title}
                          </Link>
                        ) : (
                          <span className="mega__title">{g.title}</span>
                        )}
                        <ul className="mega__links">
                          {g.links.map((l) => (
                            <li key={l.href + l.label}>
                              <Link className="mega__link" href={l.href}>
                                <span className="mega__label">{l.label}</span>
                                {l.note ? <span className="mega__note">{l.note}</span> : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {foot ? (
                    <div className="mega__foot">
                      <span>{foot.text}</span>
                      <Link className="text-link" href={foot.href}>
                        {foot.label}
                        <Icon name="arrow" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="header-actions">
            <Link className="btn btn--metal btn--sm header-cta" href="/support/demo/">
              Book a demo
            </Link>
            <button className="menu-btn" aria-label="Open menu" aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <div id="drawer" className={`drawer${drawer ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" inert={!drawer ? true : undefined}>
        <div className="drawer__top">
          <Logo />
          <button className="menu-btn" aria-label="Close menu" onClick={() => setDrawer(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer__body">
          {nav.map((m) => {
            const isOpen = acc === m.label;
            return (
              <div className="drawer__item" key={m.label}>
                <button className="drawer__btn" aria-expanded={isOpen} onClick={() => setAcc(isOpen ? null : m.label)}>
                  {m.label}
                  <Icon name="plus" />
                </button>
                <div className={`drawer__panel${isOpen ? ' is-open' : ''}`}>
                  <div>
                    <div className="drawer__group">
                      <Link className="drawer__group-title" href={m.href}>
                        Overview
                      </Link>
                    </div>
                    {m.groups.map((g) => (
                      <div className="drawer__group" key={g.title}>
                        {g.href ? (
                          <Link className="drawer__group-title" href={g.href}>
                            {g.title}
                          </Link>
                        ) : (
                          <span className="drawer__group-title">{g.title}</span>
                        )}
                        {g.links.map((l) => (
                          <Link key={l.href + l.label} href={l.href}>
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="drawer__item">
            <Link className="drawer__btn" href="/contact/">
              Contact
            </Link>
          </div>
        </div>
        <div className="drawer__foot">
          <Link className="btn btn--metal" href="/support/demo/">
            Book a demo
          </Link>
          <a className="btn btn--glass" href={`mailto:${company.email}`}>
            {company.email}
          </a>
        </div>
      </div>
    </>
  );
}
