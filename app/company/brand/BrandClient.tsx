'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Chip, SectionHead } from '@/components/ui';
import { company } from '@/lib/site';

type Swatch = {
  name: string;
  val: string;
  copy: string;
  role: string;
  bg: string;
  light?: boolean;
};

const foundations: Swatch[] = [
  { name: 'Abyss', val: '#060B18 · 6 11 24', copy: '#060B18', role: 'Page ground, footer', bg: '#060b18' },
  { name: 'Enamel', val: '#0D1A34 · 13 26 52', copy: '#0D1A34', role: 'Dark sections, slide grounds', bg: '#0d1a34' },
  { name: 'Ink', val: '#0E1B36 · 14 27 54', copy: '#0E1B36', role: 'Text on paper, dark buttons', bg: '#0e1b36' },
];

const grounds: Swatch[] = [
  { name: 'Paper', val: '#F6F0E4 · 246 240 228', copy: '#F6F0E4', role: 'Light sections, text on dark', bg: '#f6f0e4', light: true },
  { name: 'Creme', val: '#EDE3CF · 237 227 207', copy: '#EDE3CF', role: 'Alternate light sections', bg: '#ede3cf', light: true },
  { name: 'Mist', val: '#B4BED0 · 180 190 208', copy: '#B4BED0', role: 'Secondary text on dark', bg: '#b4bed0' },
];

const golds: Swatch[] = [
  { name: 'Gold', val: '#C49A45 · 196 154 69', copy: '#C49A45', role: 'Rules, icons, fills', bg: '#c49a45' },
  { name: 'Gold soft', val: '#DDBB6E · 221 187 110', copy: '#DDBB6E', role: 'Gold text on dark', bg: '#ddbb6e' },
  { name: 'Gold pale', val: '#F1D894 · 241 216 148', copy: '#F1D894', role: 'Highlights, selection', bg: '#f1d894', light: true },
  { name: 'Gold ink', val: '#8A6522 · 138 101 34', copy: '#8A6522', role: 'Gold text on paper', bg: '#8a6522' },
];

export function BrandClient() {
  const [toast, setToast] = useState<string | null>(null);

  const copy = useCallback((text: string, label?: string) => {
    try {
      navigator.clipboard.writeText(text);
      setToast(`Copied ${label || text}`);
    } catch {
      setToast(text);
    }
    setTimeout(() => {
      setToast((cur) => (cur?.includes(label || text) ? null : cur));
    }, 2800);
  }, []);

  return (
    <>
      {/* Brand Hero */}
      <section className="panel panel--deep page-hero bp-hero" aria-labelledby="brand-title">
        <div className="bp-hero__glow" aria-hidden="true" />
        <div className="wrap page-hero__inner bp-hero__inner">
          <div className="bp-hero__copy">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/company/">Company</Link>
              <span aria-hidden="true">/</span>
              <span>Brand</span>
            </nav>
            <span className="chip">
              <span className="chip__icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M8 1.5 14.5 8 8 14.5 1.5 8Z" />
                </svg>
              </span>
              Brand guidelines
            </span>
            <h1 id="brand-title" className="h1">
              How UElement looks, sounds and names things.
            </h1>
            <p className="lede muted">
              For our team, partners, resellers and the press. Use these rules wherever UElement appears in your work, from a co-branded proposal to a news story.
            </p>
            <div className="actions">
              <a className="btn btn--metal" href="#brand-kit">
                Get the brand kit
              </a>
              <a className="btn btn--glass" href="#brand-naming">
                Naming rules
              </a>
            </div>
          </div>
          <div className="bp-hero__mark">
            <div className="mark92 mark92--hero" role="img" aria-label="The UElement 92 mark">
              <span>92</span>
            </div>
            <p className="bp-hero__caption">
              Uranium, element 92 · <span>The core mark</span>
            </p>
          </div>
        </div>
      </section>

      {/* Core Lines & Taglines */}
      <section className="panel panel--paper section" aria-labelledby="brand-lines-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="compass">Voice &amp; identity</Chip>
              <h2 id="brand-lines-title" className="h2">
                The three lines we stand on.
              </h2>
            </div>
            <p className="prose muted" style={{ fontSize: 18 }}>
              Use these exact phrases. Do not rewrite, paraphrase or translate them without sign-off.
            </p>
          </div>

          <div className="grid-2 bp-lines">
            <article className="paper-card paper-card--pad bp-line">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Master tagline</span>
              <p className="bp-serif-line">{company.tagline}</p>
              <p className="muted small">
                Our primary descriptor for corporate overviews, decks, the website header and official bios.
              </p>
            </article>
            <article className="paper-card paper-card--pad bp-line">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Motto</span>
              <p className="bp-deva" lang="hi">{company.devanagari}</p>
              <p className="muted small">
                Strong · Capable · Protected. Appears under the logo and in our cultural identity.
              </p>
            </article>
            <article className="paper-card paper-card--pad bp-line">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Moral statement</span>
              <p className="bp-serif-line">{company.statement}</p>
              <p className="muted small">
                Our stance on repair over escape. For campaign moments, talks and the website, not for product sheets.
              </p>
            </article>
            <article className="paper-card paper-card--pad bp-line">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Origin line</span>
              <p className="bp-serif-line">Built in India, deployable anywhere.</p>
              <p className="muted small">
                How we describe where we come from. We serve customers across the Americas, UK and Europe, the Middle East and Africa, and JAPAC.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* The Mark */}
      <section id="brand-mark" className="panel panel--enamel section" aria-labelledby="brand-mark-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <span className="chip">
                <span className="chip__icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="2.5" y="2.5" width="11" height="11" rx="3" />
                  </svg>
                </span>
                The mark
              </span>
              <h2 id="brand-mark-title" className="h2">
                92, set in white on frosted glass.
              </h2>
            </div>
            <p className="prose muted" style={{ fontSize: 18 }}>
              The U in UElement stands for uranium, element 92. The numerals are the anchor of our identity. They are always white Montserrat, always on a frosted glass tile, and never replaced by a letter or glyph.
            </p>
          </div>

          <div className="bp-mark-grid">
            <figure className="bp-stage bp-stage--dark">
              <div className="mark92" role="img" aria-label="92 mark on a dark ground">
                <span>92</span>
              </div>
              <figcaption>
                <strong>On dark grounds</strong>
                <span>Clear glass over Abyss or Enamel. The default.</span>
              </figcaption>
            </figure>
            <figure className="bp-stage bp-stage--gold">
              <div className="mark92" role="img" aria-label="92 mark over the brand metal">
                <span>92</span>
              </div>
              <figcaption>
                <strong>Over the brand metal</strong>
                <span>For covers and event backdrops. The glass softens the gold behind it.</span>
              </figcaption>
            </figure>
            <figure className="bp-stage bp-stage--light">
              <div className="mark92 mark92--tinted" role="img" aria-label="92 mark on a light ground">
                <span>92</span>
              </div>
              <figcaption>
                <strong>On light grounds</strong>
                <span>Use the Ink-tinted glass so the white numerals keep their contrast.</span>
              </figcaption>
            </figure>
          </div>

          <div className="grid-2 bp-mark-rules">
            <div className="glass-card glass-card--pad bp-space">
              <h3 className="h4">Clear space and size</h3>
              <div className="bp-space__demo" aria-hidden="true">
                <div className="bp-space__zone">
                  <div className="mark92">
                    <span>92</span>
                  </div>
                </div>
              </div>
              <ul className="list-check small">
                <li>
                  <span>Keep clear space of half the tile&apos;s width on every side. Nothing else enters it.</span>
                </li>
                <li>
                  <span>Smallest size is 24 px on screen and 8 mm in print. Below that, use the UElement name in text.</span>
                </li>
              </ul>
            </div>
            <div className="glass-card glass-card--pad">
              <h3 className="h4">Digital lockup</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                The website and apps pair the monogram with the name and motto. Use this lockup in navigation bars and footers only.
              </p>
              <div className="bp-lockups">
                <div className="bp-lockup bp-lockup--dark">
                  <span className="logo">
                    <img src="/logo.png" alt="UElement" className="logo__img" style={{ height: 26 }} />
                  </span>
                </div>
                <div className="bp-lockup bp-lockup--light">
                  <span className="logo">
                    <img src="/logo.png" alt="UElement" className="logo__img" style={{ height: 26, filter: 'invert(1) hue-rotate(180deg) brightness(0.2)' }} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="h3 bp-subhead">Four ways to break the mark</h3>
          <div className="grid-4 bp-donts">
            <div className="glass-card bp-dont">
              <div className="bp-dont__art">
                <div className="mark92">
                  <span className="bp-deva-glyph" lang="hi">उ</span>
                </div>
              </div>
              <span className="bp-no">Don&apos;t</span>
              <p className="small">Replace the numerals with the Devanagari उ or any other letter.</p>
            </div>
            <div className="glass-card bp-dont">
              <div className="bp-dont__art">
                <div className="mark92 mark92--gold">
                  <span>92</span>
                </div>
              </div>
              <span className="bp-no">Don&apos;t</span>
              <p className="small">Recolour the numerals. They are white in every application.</p>
            </div>
            <div className="glass-card bp-dont">
              <div className="bp-dont__art">
                <div className="mark92 mark92--stretch">
                  <span>92</span>
                </div>
              </div>
              <span className="bp-no">Don&apos;t</span>
              <p className="small">Stretch, skew, rotate or outline the mark.</p>
            </div>
            <div className="glass-card bp-dont">
              <div className="bp-dont__art bp-dont__art--busy">
                <span className="bp-naked">92</span>
              </div>
              <span className="bp-no">Don&apos;t</span>
              <p className="small">Drop the glass and set the numerals straight onto photos or patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Colour Palette */}
      <section id="brand-colour" className="panel panel--paper section" aria-labelledby="brand-colour-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="eye">Colour</Chip>
              <h2 id="brand-colour-title" className="h2">
                Deep enamel, warm paper, a little gold.
              </h2>
            </div>
            <p className="prose muted" style={{ fontSize: 18 }}>
              Most of a UElement page is dark enamel or warm paper. Gold is the accent and should never fill more than about a tenth of the space. Click any swatch to copy its hex code.
            </p>
          </div>

          <div className="bp-balance" role="img" aria-label="Typical colour balance: 55 percent enamel, 35 percent paper, 8 percent gold, 2 percent mist">
            <span style={{ flex: 55, background: 'linear-gradient(90deg, #060b18, #0d1a34)' }}>
              <b>Enamel 55%</b>
            </span>
            <span style={{ flex: 35, background: 'linear-gradient(90deg, #f6f0e4, #ede3cf)', color: 'var(--ink)' }}>
              <b>Paper 35%</b>
            </span>
            <span style={{ flex: 8, background: 'var(--metal)', color: '#2a1d05' }}>
              <b>Gold</b>
            </span>
            <span style={{ flex: 2, background: '#b4bed0' }} />
          </div>

          <div className="bp-swatch-groups">
            <div className="bp-swatch-group">
              <h3 className="bp-group-title">Foundations</h3>
              <div className="bp-swatches">
                {foundations.map((s) => (
                  <button
                    key={s.name}
                    className="paper-card bp-swatch"
                    type="button"
                    onClick={() => copy(s.copy, `${s.name} (${s.copy})`)}
                    title={`Click to copy ${s.copy}`}
                  >
                    <span className={`bp-swatch__chip${s.light ? ' bp-swatch__chip--light' : ''}`} style={{ background: s.bg }} />
                    <span className="bp-swatch__name">{s.name}</span>
                    <span className="bp-swatch__val">{s.val}</span>
                    <span className="bp-swatch__role">{s.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bp-swatch-group">
              <h3 className="bp-group-title">Grounds</h3>
              <div className="bp-swatches">
                {grounds.map((s) => (
                  <button
                    key={s.name}
                    className="paper-card bp-swatch"
                    type="button"
                    onClick={() => copy(s.copy, `${s.name} (${s.copy})`)}
                    title={`Click to copy ${s.copy}`}
                  >
                    <span className={`bp-swatch__chip${s.light ? ' bp-swatch__chip--light' : ''}`} style={{ background: s.bg }} />
                    <span className="bp-swatch__name">{s.name}</span>
                    <span className="bp-swatch__val">{s.val}</span>
                    <span className="bp-swatch__role">{s.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bp-swatch-group">
              <h3 className="bp-group-title">Gold</h3>
              <div className="bp-swatches bp-swatches--4">
                {golds.map((s) => (
                  <button
                    key={s.name}
                    className="paper-card bp-swatch"
                    type="button"
                    onClick={() => copy(s.copy, `${s.name} (${s.copy})`)}
                    title={`Click to copy ${s.copy}`}
                  >
                    <span className={`bp-swatch__chip${s.light ? ' bp-swatch__chip--light' : ''}`} style={{ background: s.bg }} />
                    <span className="bp-swatch__name">{s.name}</span>
                    <span className="bp-swatch__val">{s.val}</span>
                    <span className="bp-swatch__role">{s.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2 bp-colour-notes">
            <div className="metal-plate bp-metal">
              <span className="vm__label" style={{ color: '#4a3410' }}>Brand metal</span>
              <p className="h3" style={{ color: '#2a1d05' }}>
                A six-stop gold gradient at 118°.
              </p>
              <p className="small" style={{ color: '#3a2808' }}>
                Reserved for primary buttons, medals and status marks. Never use it as a section background or behind running text.
              </p>
            </div>
            <div className="paper-card paper-card--pad">
              <h3 className="h4">Contrast for text</h3>
              <table className="bp-contrast">
                <caption className="sr-only">Contrast ratios of text and ground pairs</caption>
                <thead>
                  <tr>
                    <th scope="col">Text on ground</th>
                    <th scope="col">Ratio</th>
                    <th scope="col">Use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="bp-pair" style={{ background: '#f6f0e4', color: '#0e1b36' }}>
                        Ink on Paper
                      </span>
                    </td>
                    <td>15.1 : 1</td>
                    <td>
                      <span className="status status--line">Any text</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="bp-pair" style={{ background: '#060b18', color: '#ddbb6e' }}>
                        Gold soft on Abyss
                      </span>
                    </td>
                    <td>10.7 : 1</td>
                    <td>
                      <span className="status status--line">Any text</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="bp-pair" style={{ background: '#f6f0e4', color: '#8a6522' }}>
                        Gold ink on Paper
                      </span>
                    </td>
                    <td>4.7 : 1</td>
                    <td>
                      <span className="status status--line">Body and up</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="bp-pair" style={{ background: '#f6f0e4', color: '#c49a45' }}>
                        Gold on Paper
                      </span>
                    </td>
                    <td>2.3 : 1</td>
                    <td>
                      <span className="status status--dash">Never for text</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section id="brand-type" className="panel panel--creme section" aria-labelledby="brand-type-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="compass">Typography</Chip>
              <h2 id="brand-type-title" className="h2">
                One working face, one voice for statements.
              </h2>
            </div>
            <p className="prose muted" style={{ fontSize: 18 }}>
              Onest does almost everything. Instrument Serif speaks only when we make a statement. Montserrat exists for the 92 mark and nothing else. All three are free on Google Fonts.
            </p>
          </div>

          <div className="bp-faces">
            <article className="paper-card bp-face">
              <div className="bp-face__spec" style={{ fontFamily: 'var(--font-sans)', fontWeight: 560 }}>
                Aa
              </div>
              <div className="bp-face__body">
                <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Onest · 400 to 700</span>
                <h3 className="h3">Headlines, body, interface</h3>
                <p className="muted small">Headlines at weight 500 with tight tracking. Body at 400. Labels and buttons at 560 to 600.</p>
                <p className="bp-sample" style={{ fontFamily: 'var(--font-sans)' }}>
                  Quantum-safe migration for banks, one application at a time.
                </p>
              </div>
            </article>

            <article className="paper-card bp-face">
              <div className="bp-face__spec" style={{ fontFamily: 'var(--font-serif)' }}>
                Aa
              </div>
              <div className="bp-face__body">
                <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Instrument Serif · Regular</span>
                <h3 className="h3">Statements and pull quotes</h3>
                <p className="muted small">One serif line per section at most. Never for body copy, buttons or labels.</p>
                <p className="bp-sample" style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.15 }}>
                  No Plan B. No Planet B.
                </p>
              </div>
            </article>

            <article className="paper-card bp-face">
              <div className="bp-face__spec" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                92
              </div>
              <div className="bp-face__body">
                <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Montserrat · SemiBold</span>
                <h3 className="h3">The 92 mark only</h3>
                <p className="muted small">Do not use Montserrat for headings or body text. Keeping it to the mark keeps the mark distinct.</p>
              </div>
            </article>

            <article className="paper-card bp-face">
              <div className="bp-face__spec" lang="hi" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: 500 }}>
                अ
              </div>
              <div className="bp-face__body">
                <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Noto Sans Devanagari · Medium</span>
                <h3 className="h3">The motto and Hindi or Marathi copy</h3>
                <p className="muted small">Pairs with Onest at the same visual weight. Set the motto with a little extra letter spacing.</p>
              </div>
            </article>
          </div>

          <div className="paper-card bp-scale-wrap">
            <table className="bp-scale">
              <caption className="sr-only">Type scale</caption>
              <thead>
                <tr>
                  <th scope="col">Style</th>
                  <th scope="col">Size on desktop</th>
                  <th scope="col">Line height</th>
                  <th scope="col">Sample</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Display</td>
                  <td>96 px</td>
                  <td>0.98</td>
                  <td>
                    <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.042em', lineHeight: 1 }}>
                      Sovereign DeepTech
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Heading 1</td>
                  <td>74 px</td>
                  <td>1.02</td>
                  <td>
                    <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.038em' }}>
                      The UElement brand
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Heading 2</td>
                  <td>52 px</td>
                  <td>1.06</td>
                  <td>
                    <span style={{ fontSize: 23, fontWeight: 500, letterSpacing: '-0.032em' }}>
                      What we believe
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Heading 3</td>
                  <td>23 px</td>
                  <td>1.25</td>
                  <td>
                    <span style={{ fontSize: 19, fontWeight: 560 }}>
                      Proof over promises
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Lede</td>
                  <td>20 px</td>
                  <td>1.6</td>
                  <td>
                    <span style={{ fontSize: 17 }}>
                      Every engagement starts with a fixed-scope first step.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Body</td>
                  <td>17 px</td>
                  <td>1.6</td>
                  <td>
                    <span style={{ fontSize: 15 }}>
                      We claim only what we can show.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Small</td>
                  <td>14.5 px</td>
                  <td>1.55</td>
                  <td>
                    <span style={{ fontSize: 13 }}>
                      Wakad, Pune, Maharashtra 411057, India
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Voice */}
      <section id="brand-voice" className="panel panel--enamel section" aria-labelledby="brand-voice-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Chip icon="mesh">Voice</Chip>
            </div>
            <h2 id="brand-voice-title" className="h2">
              Calm, specific and provable.
            </h2>
            <p className="lede muted">
              We write for CISOs, bank boards and engineers who have heard every promise before. The way to earn their attention is to be exact.
            </p>
          </div>

          <div className="bp-voice">
            <div className="glass-card glass-card--pad bp-voice__pair">
              <h3 className="h4">Claim only what you can show</h3>
              <p className="bp-say bp-say--yes">
                <span>Write</span>Paid pilot with an insurer, covering one web application.
              </p>
              <p className="bp-say bp-say--no">
                <span>Not</span>Trusted by India&apos;s leading financial institutions.
              </p>
            </div>

            <div className="glass-card glass-card--pad bp-voice__pair">
              <h3 className="h4">Name the risk without selling fear</h3>
              <p className="bp-say bp-say--yes">
                <span>Write</span>Data encrypted today can be stored now and decrypted later. Migration takes years, so planning starts now.
              </p>
              <p className="bp-say bp-say--no">
                <span>Not</span>Quantum computers will break your bank tomorrow.
              </p>
            </div>

            <div className="glass-card glass-card--pad bp-voice__pair">
              <h3 className="h4">Say what it does, plainly</h3>
              <p className="bp-say bp-say--yes">
                <span>Write</span>Finds every algorithm and key in an application and lists what must change.
              </p>
              <p className="bp-say bp-say--no">
                <span>Not</span>A revolutionary, unhackable, next-generation security paradigm.
              </p>
            </div>

            <div className="glass-card glass-card--pad bp-voice__pair">
              <h3 className="h4">Label maturity honestly</h3>
              <p className="bp-say bp-say--yes">
                <span>Write</span>In research. In pilot. Generally available.
              </p>
              <p className="bp-say bp-say--no">
                <span>Not</span>Calling a prototype a platform, or a roadmap item a feature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Naming */}
      <section id="brand-naming" className="panel panel--paper section" aria-labelledby="brand-naming-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="key">Naming</Chip>
              <h2 id="brand-naming-title" className="h2">
                Write every name exactly as it appears here.
              </h2>
            </div>
            <p className="prose muted" style={{ fontSize: 18 }}>
              Our names use deliberate capital letters. Keep them, including in headings, slide titles and labels where the rest of the text is set in capitals.
            </p>
          </div>

          <dl className="kv bp-rules">
            <div>
              <dt>Company</dt>
              <dd>
                <strong>UElement</strong>, one word, capital U and E. The legal name is <strong>UElement Technologies Private Limited</strong>.
                <span className="bp-never">Never: Uelement · U-Element · UELEMENT in running text · Unified Element</span>
              </dd>
            </div>
            <div>
              <dt>DeepTech</dt>
              <dd>
                One word, capital D and T. Keep it prominent in anything that describes what we do.
                <span className="bp-never">Never: Deeptech · deep tech · Deep-Tech</span>
              </dd>
            </div>
            <div>
              <dt>Internal codenames</dt>
              <dd>
                Element and isotope names such as U92, U234 and U235 are for internal projects only. They never appear in proposals, decks, the website or press material.
              </dd>
            </div>
            <div>
              <dt>Where we work</dt>
              <dd>
                UElement serves customers globally. Describe our reach as global, never as a single region.
              </dd>
            </div>
          </dl>

          <div className="bp-families">
            <article className="paper-card paper-card--pad bp-family">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Quantum security</span>
              <p className="bp-family__name">UElement AdviQ</p>
              <p className="muted small">Cryptographic discovery and post-quantum migration. Write the product as AdviQ, with a capital Q.</p>
            </article>
            <article className="paper-card paper-card--pad bp-family">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Enterprise platforms</span>
              <p className="bp-family__name">MainSTAY</p>
              <ul className="bp-family__list">
                <li>
                  <b>Nexus</b>
                  <span>The enterprise digital fabric</span>
                </li>
                <li>
                  <b>Vizor</b>
                  <span>Observability, security and compliance</span>
                </li>
                <li>
                  <b>Kayak</b>
                  <span>Everything as a Service</span>
                </li>
              </ul>
            </article>
            <article className="paper-card paper-card--pad bp-family">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>Sovereign edge</span>
              <p className="bp-family__name">MainSPAR</p>
              <ul className="bp-family__list">
                <li>
                  <b>KalAMOS</b>
                  <span>Sovereign edge-AI OS</span>
                </li>
                <li>
                  <b>BoSC3</b>
                  <span>Agentic command and control</span>
                </li>
                <li>
                  <b>NobisGRID</b>
                  <span>Self-healing mesh</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Brand Kit and Press */}
      <section id="brand-kit" className="panel panel--deep section" aria-labelledby="brand-kit-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Chip icon="shield">Brand kit and press</Chip>
            </div>
            <h2 id="brand-kit-title" className="h2">
              Using our brand in your work.
            </h2>
          </div>

          <div className="grid-2">
            <div className="glass-card glass-card--pad bp-kit">
              <h3 className="h3">Request the brand kit</h3>
              <p className="muted">We send the kit on request so every partner gets the current version.</p>
              <ul className="list-check small">
                <li><span>The 92 mark for dark and light grounds, as SVG and PNG</span></li>
                <li><span>The UElement wordmark and digital lockup</span></li>
                <li><span>Colour values for screen and print</span></li>
                <li><span>Font names and links</span></li>
              </ul>
              <div className="bp-copyline">
                <span className="bp-copyline__label">Write to</span>
                <span className="bp-copyline__value">{company.email}</span>
                <button
                  className="btn btn--glass btn--sm"
                  type="button"
                  onClick={() => copy(company.email, 'email address')}
                >
                  Copy address
                </button>
              </div>
            </div>

            <div className="glass-card glass-card--pad bp-kit">
              <h3 className="h3">Partners, resellers and press</h3>
              <ul className="list-check small">
                <li><span>Ask us before placing our mark next to yours. Send the draft and we will review it.</span></li>
                <li><span>Give the two marks equal height and keep the clear space around each.</span></li>
                <li><span>Describe us with the master tagline, or as a DeepTech company from Pune, India.</span></li>
                <li><span>Use product names exactly as listed above, and label pilots as pilots.</span></li>
              </ul>
              <dl className="bp-facts small">
                <div>
                  <dt>Legal name</dt>
                  <dd>{company.name}</dd>
                </div>
                <div>
                  <dt>CIN</dt>
                  <dd>{company.cin}</dd>
                </div>
                <div>
                  <dt>Head office</dt>
                  <dd>{company.address}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>www.uelement.in</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{company.phone}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Let's Talk CTA Section */}
      <section className="panel panel--paper section" aria-labelledby="talk-brand">
        <div className="wrap" style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
            <Chip icon="compass">Let&apos;s talk</Chip>
            <h2 id="talk-brand" className="h2">
              Building something that cannot fail? We&apos;d like to hear about it.
            </h2>
            <p className="lede muted">
              Every engagement starts with a small, fixed-scope first step, so you can judge our work before you commit to more.
            </p>
            <div className="actions">
              <Link className="btn btn--ink" href="/contact/">
                Talk to us
              </Link>
              <Link className="btn btn--line" href="/support/demo/">
                Book a demo
              </Link>
            </div>
          </div>
          <div className="grid" style={{ ['--gap' as string]: '12px' }}>
            <a className="paper-card founder card-link" href={`mailto:${company.email}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="mail" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>{company.email}</span>
                <span className="founder__role">Write to us about a project, a partnership or a role.</span>
              </span>
            </a>
            <a className="paper-card founder card-link" href={`tel:${company.phoneHref}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="phone" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>{company.phone}</span>
                <span className="founder__role">Call us to talk it through</span>
              </span>
            </a>
            <div className="paper-card founder">
              <span className="medal">
                <Icon name="pin" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>{company.address}</span>
                <span className="founder__role">Working with customers globally</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Toast popup */}
      {toast && (
        <div className="toast-message" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
