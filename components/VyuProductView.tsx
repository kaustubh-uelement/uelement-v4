'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { openVyuScanner, VyuScannerModal } from './VyuScannerModal';
import './vyu/vyu.css';

const REPORT_PAGES = [
  {
    id: 'glance',
    num: '01',
    title: 'At a glance',
    desc: 'Score, grade, severity counts and the three fixes that matter most.',
    img: '/images/vyu/w-01-glance.jpg',
    cap: 'Page 2: At a glance',
    alt: 'Sample report page: At a glance, with readiness score 31 of 100, severity counts and three fixes',
  },
  {
    id: 'exposure',
    num: '02',
    title: 'Exposure and workload',
    desc: 'When recorded traffic could be read, issues by area, and which team fixes what.',
    img: '/images/vyu/w-02-exposure.jpg',
    cap: 'Page 3: Exposure and workload',
    alt: 'Sample report page: exposure timeline, issues by area and severity, who fixes what, and migration path',
  },
  {
    id: 'handshake',
    num: '03',
    title: 'The handshake',
    desc: 'All 21 key exchanges offered, what the server accepted, and the certificate it served.',
    img: '/images/vyu/w-03-handshake.jpg',
    cap: 'Page 4: The handshake',
    alt: 'Sample report page: key exchanges offered and accepted, protocol versions and certificate lifetime',
  },
  {
    id: 'findings',
    num: '04',
    title: 'Findings',
    desc: 'What we found, how we know, and exactly what to change.',
    img: '/images/vyu/w-04-findings.jpg',
    cap: 'Page 5: Findings',
    alt: 'Sample report page: finding cards with what was found and what to do',
  },
  {
    id: 'cover',
    num: '05',
    title: 'Cover',
    desc: 'Signed, dated and addressed to your organisation.',
    img: '/images/vyu/w-05-cover.jpg',
    cap: 'Cover page',
    alt: 'Sample report cover for the demo bank: score 31, post-quantum key exchange off, 18 issues',
  },
];

export function VyuProductView() {
  // Hero Scan Box State
  const [kind, setKind] = useState<'website' | 'github'>('website');
  const [target, setTarget] = useState('');
  const [scanErr, setScanErr] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Sample Result Animated Rows
  const [activeRow, setActiveRow] = useState<number>(-1);

  // Mosca Calculator State
  const [life, setLife] = useState(10);
  const [qYear, setQYear] = useState(2035);
  const [mig, setMig] = useState(3);
  const nowYear = new Date().getFullYear();

  // Report Tour Tab State
  const [activeTourIndex, setActiveTourIndex] = useState(0);

  // Auto replay animation for sample result rows
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      setActiveRow(current);
      current = (current + 1) % 5;
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Handle Scan Box Submit
  const handleScanboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanErr('');
    const t = target.trim();
    if (!t) {
      setScanErr(
        kind === 'github'
          ? 'Enter a repository, for example owner/repository.'
          : 'Enter a domain, for example example.com.'
      );
      scanInputRef.current?.focus();
      return;
    }
    openVyuScanner({ kind, target: t });
  };

  // Scroll to scan box
  const scrollToScanbox = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('hero-scanbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 400);
    }
  };

  // Calculator Math (Mosca's Inequality)
  const exposedFrom = qYear - life;
  const startBy = exposedFrom - mig;
  const a0 = Math.min(nowYear - 8, exposedFrom - 2);
  const a1 = Math.max(qYear + 3, nowYear + 12);
  const pct = (y: number) => Math.max(0, Math.min(100, ((y - a0) / (a1 - a0)) * 100));

  let calcVerdictClass = 'vyu-verdict-big';
  let calcVerdictText = '';
  let calcSubText = '';

  if (exposedFrom <= nowYear) {
    calcVerdictClass = 'vyu-verdict-big bad';
    calcVerdictText = `Yes. Traffic recorded since ${exposedFrom} would still be secret when a quantum computer arrives in ${qYear}.`;
    calcSubText =
      'Every day without post-quantum key exchange adds to what can be read later. Protecting data in transit is the first fix.';
  } else if (startBy <= nowYear) {
    calcVerdictClass = 'vyu-verdict-big bad';
    calcVerdictText = `Almost. Recordings from ${exposedFrom} on are exposed, and a ${mig}-year migration had to start by ${startBy}.`;
    calcSubText =
      'Start with an inventory, and turn on hybrid key exchange wherever your stack already supports it.';
  } else {
    calcVerdictClass = 'vyu-verdict-big ok';
    calcVerdictText = `Not yet. You have until ${startBy} to start a ${mig}-year migration.`;
    calcSubText =
      `Recordings from ${exposedFrom} onwards would be at risk, so an inventory now keeps that date comfortable.`;
  }

  const activeTour = REPORT_PAGES[activeTourIndex];

  return (
    <div className="vyu-container" id="vyu-page">
      {/* ── HERO SECTION ── */}
      <section className="vyu-band vyu-hero" aria-labelledby="hero-title">
        <div className="vyu-wrap">
          <div>
            <nav className="vyu-crumbs" aria-label="Breadcrumb">
              <Link href="/platforms/">Platforms</Link>
              <span aria-hidden="true">/</span>
              <Link href="/platforms/u92-quantum/">U92 Quantum</Link>
              <span aria-hidden="true">/</span>
              <span>U92-Vyu</span>
            </nav>

            <span className="vyu-label vyu-lab-live" style={{ marginBottom: 16 }}>
              <i aria-hidden="true" />
              Live, free to use
            </span>

            <h1 id="hero-title">Is your website ready for quantum computers?</h1>
            <p className="vyu-lead">
              U92-Vyu finds the encryption in your website, API or public GitHub
              code that a quantum computer will break, scores how exposed you are,
              and tells each team what to fix first. Free and passive, and it takes
              about a minute.
            </p>

            <form
              className="vyu-scanbox"
              id="hero-scanbox"
              onSubmit={handleScanboxSubmit}
              noValidate
            >
              <div className="vyu-tabs" role="tablist" aria-label="What to scan">
                <button
                  type="button"
                  className="vyu-tab"
                  role="tab"
                  aria-selected={kind === 'website'}
                  onClick={() => {
                    setKind('website');
                    setScanErr('');
                  }}
                >
                  Website or API
                </button>
                <button
                  type="button"
                  className="vyu-tab"
                  role="tab"
                  aria-selected={kind === 'github'}
                  onClick={() => {
                    setKind('github');
                    setScanErr('');
                  }}
                >
                  Public GitHub code
                </button>
              </div>

              <div className="vyu-field">
                <label htmlFor="hero-target-input" className="sr-only">
                  Target to scan
                </label>
                <input
                  id="hero-target-input"
                  ref={scanInputRef}
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={
                    kind === 'website' ? 'yourbank.com' : 'owner/repository'
                  }
                  autoComplete="off"
                  spellCheck="false"
                />
                <button className="btn btn--metal" type="submit">
                  Check my readiness
                </button>
              </div>

              {scanErr && <p className="err">{scanErr}</p>}

              <small>
                {kind === 'website'
                  ? 'Enter a domain such as example.com or api.example.com. You confirm you are authorised on the next screen.'
                  : 'Enter a public GitHub repository (e.g. owner/repo). You confirm you are authorised on the next screen.'}
              </small>
            </form>

            <ul className="vyu-assure-list" aria-label="What to expect">
              <li>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="8" r="8" fill="#6CC69A" />
                  <path
                    d="M4.6 8.3l2.2 2.2 4.6-4.8"
                    fill="none"
                    stroke="#0D1A34"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                No sign-up to see results
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="8" r="8" fill="#6CC69A" />
                  <path
                    d="M4.6 8.3l2.2 2.2 4.6-4.8"
                    fill="none"
                    stroke="#0D1A34"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nothing is attacked or logged into
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="8" r="8" fill="#6CC69A" />
                  <path
                    d="M4.6 8.3l2.2 2.2 4.6-4.8"
                    fill="none"
                    stroke="#0D1A34"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Signed report you can verify
              </li>
            </ul>
          </div>

          {/* Sample Result Card */}
          <div className="vyu-result-card" aria-label="Sample result">
            <header>
              <b>Sample result</b>
              <span>Our fictional demo bank</span>
            </header>

            <div className="vyu-rgrid">
              <svg
                className="vyu-gauge"
                viewBox="0 0 120 120"
                role="img"
                aria-label="Readiness score 31 out of 100, grade E"
              >
                <defs>
                  <linearGradient id="sampleMg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7A5A1E" />
                    <stop offset="0.42" stopColor="#F1D894" />
                    <stop offset="0.58" stopColor="#C49A45" />
                    <stop offset="1" stopColor="#8F6A28" />
                  </linearGradient>
                </defs>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,.1)"
                  strokeWidth="10"
                />
                <circle
                  className="arc"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="url(#sampleMg)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="314.16"
                  strokeDashoffset="216.77"
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="64"
                  textAnchor="middle"
                  fontFamily="var(--font-reddit, 'Reddit Sans', system-ui, sans-serif)"
                  fontWeight="700"
                  fontSize="34"
                  fill="#fff"
                >
                  31
                </text>
                <text
                  x="60"
                  y="84"
                  textAnchor="middle"
                  fontFamily="var(--font-reddit, 'Reddit Sans', system-ui, sans-serif)"
                  fontWeight="600"
                  fontSize="11"
                  letterSpacing="0.04em"
                  fill="#9AA5BB"
                >
                  Grade E
                </text>
              </svg>

              <div className="vyu-rstats">
                <div className="vyu-rs">
                  <span>Post-quantum key exchange</span>
                  <b className="bad">Off</b>
                </div>
                <div className="vyu-rs">
                  <span>Issues to fix</span>
                  <b className="warn">18</b>
                </div>
                <div className="vyu-rs">
                  <span>Crypto assets found</span>
                  <b>23</b>
                </div>
                <div className="vyu-rs">
                  <span>Quantum-vulnerable</span>
                  <b className="bad">70%</b>
                </div>
              </div>
            </div>

            <div className="vyu-rows" aria-label="Key exchange offers and replies">
              <div className={`vyu-row pq ${activeRow === 0 ? 'lit' : ''}`}>
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7.3" fill="none" stroke="#7D879C" strokeWidth="1.2" />
                  <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#7D879C" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="g">X25519MLKEM768</span>
                <span className="r">Refused</span>
              </div>
              <div className={`vyu-row pq ${activeRow === 1 ? 'lit' : ''}`}>
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7.3" fill="none" stroke="#7D879C" strokeWidth="1.2" />
                  <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#7D879C" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="g">SecP256r1MLKEM768</span>
                <span className="r">Refused</span>
              </div>
              <div className={`vyu-row pq ${activeRow === 2 ? 'lit' : ''}`}>
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7.3" fill="none" stroke="#7D879C" strokeWidth="1.2" />
                  <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#7D879C" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="g">SecP384r1MLKEM1024</span>
                <span className="r">Refused</span>
              </div>
              <div className={`vyu-row yes ${activeRow === 3 ? 'lit' : ''}`}>
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="8" fill="#2F7A57" />
                  <path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="g">x25519</span>
                <span className="r">Accepted, first choice</span>
              </div>
            </div>

            <p className="note">
              <b>What will yours say?</b> Gold rows are post-quantum key
              exchanges. Vyu offers each of 21 groups on its own and records the
              server&apos;s answer.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE RISK SECTION ── */}
      <section className="vyu-band dark" id="risk" aria-labelledby="risk-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">The risk, in plain words</p>
          <h2 className="vyu-h2" id="risk-title">
            Your encrypted traffic can be copied today and read later
          </h2>
          <p className="vyu-lead">
            This is called harvest now, decrypt later. No quantum computer can do
            it yet, but data that must stay private for years is at risk from the
            moment it is recorded.
          </p>

          <ol className="vyu-story">
            <li>
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" />
                <path d="M12 22h20M26 16l6 6-6 6" stroke="#F1D894" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="22" r="3" fill="#F1D894" />
              </svg>
              <h3>Recorded today</h3>
              <p>
                Anyone on the network path can copy encrypted sessions: logins,
                payments, API calls. They cannot read them yet.
              </p>
              <p className="yr">Happening now</p>
            </li>
            <li>
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" />
                <ellipse cx="22" cy="14" rx="9" ry="3.5" stroke="#F1D894" strokeWidth="2" fill="none" />
                <path d="M13 14v16c0 2 4 3.5 9 3.5s9-1.5 9-3.5V14M13 22c0 2 4 3.5 9 3.5s9-1.5 9-3.5" stroke="#F1D894" strokeWidth="2" fill="none" />
              </svg>
              <h3>Stored for years</h3>
              <p>
                Storage is cheap. Recordings can be kept until the tools to open
                them exist.
              </p>
              <p className="yr">The years in between</p>
            </li>
            <li>
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" />
                <rect x="13" y="20" width="18" height="13" rx="2.5" stroke="#E0705F" strokeWidth="2" fill="none" />
                <path d="M17 20v-4a5 5 0 019.6-2" stroke="#E0705F" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <h3>Read later</h3>
              <p>
                A large quantum computer breaks the RSA and elliptic-curve key
                exchange that protects almost all of today&apos;s traffic.
              </p>
              <p className="yr">Expected in the 2030s</p>
            </li>
          </ol>

          <div className="vyu-relief">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="8" fill="#6CC69A" />
              <path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#0D1A34" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>
              <b>The fix for data in transit already exists.</b> Hybrid
              post-quantum key exchange (X25519MLKEM768, built on NIST&apos;s
              ML-KEM standard, FIPS 203) keeps recordings unreadable. Chrome,
              Edge, Firefox and Safari already offer it. On most modern stacks
              your server or CDN needs only a configuration change to accept it,
              and Vyu tells you whether it does.
            </p>
          </div>

          {/* Exposure Calculator */}
          <div className="vyu-calc" aria-labelledby="calc-title">
            <div>
              <h3 id="calc-title">Are you already exposed? Try it.</h3>
              <p className="vyu-lead" style={{ fontSize: 16 }}>
                Pick how long your data must stay confidential and when you think a
                quantum computer will arrive. Customer records under banking or
                health rules often need ten years or more.
              </p>

              <div className="vyu-ctl">
                <div>
                  <span className="lbl">Data must stay confidential for:</span>
                  <div className="vyu-seg" role="group">
                    {[2, 5, 10, 15, 25].map((y) => (
                      <button
                        key={y}
                        type="button"
                        aria-pressed={life === y}
                        onClick={() => setLife(y)}
                      >
                        {y} years
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="lbl">A quantum computer arrives in:</span>
                  <div className="vyu-seg" role="group">
                    {[2030, 2033, 2035, 2040].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        aria-pressed={qYear === yr}
                        onClick={() => setQYear(yr)}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="lbl">Your migration will take:</span>
                  <div className="vyu-seg" role="group">
                    {[1, 3, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={mig === m}
                        onClick={() => setMig(m)}
                      >
                        {m} {m === 1 ? 'year' : 'years'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="vyu-out" aria-live="polite">
              <p className={calcVerdictClass}>{calcVerdictText}</p>
              <p className="sub">{calcSubText}</p>

              <div className="vyu-tlbar">
                {exposedFrom < nowYear && (
                  <div
                    className="seg-r"
                    style={{
                      left: `${pct(exposedFrom)}%`,
                      width: `${pct(nowYear) - pct(exposedFrom)}%`,
                    }}
                  />
                )}
                <div
                  className="seg-o"
                  style={{
                    left: `${pct(Math.max(exposedFrom, nowYear))}%`,
                    width: `${pct(qYear) - pct(Math.max(exposedFrom, nowYear))}%`,
                    borderRadius: exposedFrom < nowYear ? '0 4px 4px 0' : '4px',
                  }}
                />
                <div className="mk" style={{ left: `${pct(nowYear)}%` }}>
                  <span>Today, {nowYear}</span>
                </div>
                <div className="q" style={{ left: `${pct(qYear)}%` }} />
                <span className="ql" style={{ left: `${pct(qYear)}%` }}>
                  Quantum computer, {qYear}
                </span>
              </div>

              <div className="vyu-tlaxis">
                <span>{a0}</span>
                <span>{a1}</span>
              </div>

              <div className="vyu-legend">
                <span>
                  <i style={{ background: '#C9473C' }} />
                  Already recorded, readable later
                </span>
                <span>
                  <i style={{ background: '#E29A62' }} />
                  At risk if recorded before you migrate
                </span>
              </div>

              <small>
                This is Mosca&apos;s inequality, widely used in post-quantum
                planning: if the years your data must stay secret plus the years a
                migration takes reach past the arrival of a quantum computer, you
                are exposed. The Vyu report applies it to your real handshake.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUESTIONS ANSWERED ── */}
      <section className="vyu-band paper" id="answers" aria-labelledby="answers-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">What one scan tells you</p>
          <h2 className="vyu-h2" id="answers-title">
            Six questions your board, auditor or CISO will ask
          </h2>
          <p className="vyu-lead">
            Each answer comes with the evidence behind it. At the foot of each
            card is the answer from our sample scan.
          </p>

          <div className="vyu-qs">
            <div className="vyu-qc">
              <h3>Is our traffic safe from harvest now, decrypt later?</h3>
              <p>
                Whether your server accepts any of the post-quantum key exchanges
                browsers now offer, and which it prefers.
              </p>
              <div className="ans">
                <b className="bad">0 of 6</b>
                post-quantum groups accepted
              </div>
            </div>

            <div className="vyu-qc">
              <h3>How ready are we, in one number?</h3>
              <p>
                A readiness score from 0 to 100 and a grade from A to E, with the
                method printed in the report so anyone can check it.
              </p>
              <div className="ans">
                <b>31 / 100</b>
                Grade E, high quantum exposure
              </div>
            </div>

            <div className="vyu-qc">
              <h3>What cryptography do we actually run?</h3>
              <p>
                A cryptographic bill of materials: every algorithm, key,
                certificate and protocol found, as a CycloneDX file.
              </p>
              <div className="ans">
                <b>23 assets</b>
                16 quantum-vulnerable, 2 weak even today
              </div>
            </div>

            <div className="vyu-qc">
              <h3>Are there known vulnerabilities on our pages?</h3>
              <p>
                JavaScript libraries and their versions, matched against
                published CVEs, plus scripts loaded without integrity checks.
              </p>
              <div className="ans">
                <b className="bad">2 libraries</b>
                with published CVEs
              </div>
            </div>

            <div className="vyu-qc">
              <h3>Will our certificates survive the new rules?</h3>
              <p>
                Key types and lifetimes against the CA/Browser Forum limits,
                which fall to 47 days by 2029.
              </p>
              <div className="ans">
                <b className="bad">397 days</b>
                lifetime, over today&apos;s 200-day limit
              </div>
            </div>

            <div className="vyu-qc">
              <h3>Who needs to do what?</h3>
              <p>
                Every issue is ranked and assigned to the team that usually
                fixes it, with the change to make.
              </p>
              <div className="ans">
                <b>18 issues</b>
                across 6 teams, 3 to fix first
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REPORT TOUR ── */}
      <section className="vyu-band creme" id="report" aria-labelledby="report-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">The report</p>
          <h2 className="vyu-h2" id="report-title">
            A ten-page report your leadership can read in five minutes
          </h2>
          <p className="vyu-lead">
            Charts first, detail after. Leave a work email and we send the signed
            PDF with your CycloneDX file. Pick a page to look inside the sample.
          </p>

          <div className="vyu-tour">
            <div className="vyu-tourtabs" role="tablist" aria-label="Report pages">
              {REPORT_PAGES.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className="vyu-tt"
                  role="tab"
                  aria-selected={activeTourIndex === idx}
                  onClick={() => setActiveTourIndex(idx)}
                >
                  <span className="n">{p.num}</span>
                  <div>
                    <b>{p.title}</b>
                    <span className="d">{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <figure className="vyu-sheet" id="sheet" role="tabpanel">
                <Image
                  src={activeTour.img}
                  alt={activeTour.alt}
                  width={760}
                  height={1075}
                  priority={activeTourIndex === 0}
                  style={{ width: '100%', height: 'auto' }}
                />
                <figcaption>{activeTour.cap}</figcaption>
              </figure>

              <div className="vyu-files" aria-label="What you receive">
                <span>
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M4 1.5h5.5L13 5v9.5H4z" fill="none" stroke="#8A6522" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M9.5 1.5V5H13" fill="none" stroke="#8A6522" strokeWidth="1.3" />
                  </svg>
                  Signed summary PDF
                </span>
                <span>
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M4 1.5h5.5L13 5v9.5H4z" fill="none" stroke="#8A6522" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M9.5 1.5V5H13" fill="none" stroke="#8A6522" strokeWidth="1.3" />
                  </svg>
                  CBOM and SBOM, CycloneDX 1.7
                </span>
                <span>
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M4 1.5h5.5L13 5v9.5H4z" fill="none" stroke="#8A6522" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M9.5 1.5V5H13" fill="none" stroke="#8A6522" strokeWidth="1.3" />
                  </svg>
                  Online verification page
                </span>
              </div>

              <p className="vyu-sample-link">
                From a scan of our fictional demo bank.{' '}
                <button
                  type="button"
                  data-vyu-open
                  data-vyu-target="demo.bank.uelement.co"
                  data-vyu-kind="website"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'inherit',
                    font: 'inherit',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Inspect demo bank assessment ↗
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT CHECKS (COVERAGE) ── */}
      <section className="vyu-band paper" id="checks" aria-labelledby="checks-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">Coverage</p>
          <h2 className="vyu-h2" id="checks-title">What a free scan checks</h2>
          <p className="vyu-lead">
            Only what any visitor&apos;s browser or a public API can see. Nothing
            is logged into, attacked or load-tested.
          </p>

          <div className="vyu-checks">
            <div>
              <h3>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9s1.3-6.2 3.9-9z" />
                </svg>
                Websites and APIs
              </h3>
              <ul>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Post-quantum key exchange:</b> all 21 TLS groups offered
                    one by one, including the three hybrid ML-KEM groups.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Protocols and ciphers:</b> TLS 1.3 and 1.2, cipher order,
                    forward secrecy, AES-256 versus AES-128.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Certificate:</b> key type and size, chain, expiry and
                    lifetime against CA/Browser Forum limits.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>DNS and email:</b> CAA, DNSSEC, SPF, DMARC, DKIM key
                    sizes and MTA-STS.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Web hardening:</b> HSTS, HTTPS redirect, cookie flags, and
                    the CDN or server in front.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Page scripts (SBOM):</b> JavaScript libraries, versions and
                    known CVEs.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Login token keys:</b> algorithms and sizes your identity
                    provider publishes.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Certificate logs:</b> live certificates for your domain and
                    subdomains, from public CT logs.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="6" cy="6" r="2.2" />
                  <circle cx="6" cy="18" r="2.2" />
                  <circle cx="18" cy="8" r="2.2" />
                  <path d="M6 8.2v7.6M18 10.2c0 4-6 3.2-11 6" />
                </svg>
                Public GitHub code
              </h3>
              <ul>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Crypto in code:</b> RSA, elliptic curves, MD5, SHA-1, DES,
                    RC4, ECB and static IVs across nine languages.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Post-quantum already in use:</b> ML-KEM, ML-DSA and
                    SLH-DSA in code or configuration.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Server and cloud config:</b> nginx, Apache, Spring Boot,
                    AWS load balancers, KMS keys, Kubernetes certificates.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Dependencies (SBOM):</b> packages from ten manifest
                    types, with advisories from the OSV database.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Committed secrets:</b> private keys and cloud keys,
                    counted by type. Values are never stored.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>Runtimes:</b> Go, Java and base images older than their
                    first post-quantum release.
                  </span>
                </li>
                <li>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <b>CI pipelines:</b> unpinned GitHub Actions, risky triggers
                    and over-broad tokens.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="vyu-band dark" aria-labelledby="how-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">How it works</p>
          <h2 className="vyu-h2" id="how-title">
            Three steps, no install, no account
          </h2>

          <ol className="vyu-steps">
            <li>
              <span className="n">Step 01</span>
              <h3>Enter a domain or repository</h3>
              <p>Confirm you are authorised to request the evaluation.</p>
            </li>
            <li>
              <span className="n">Step 02</span>
              <h3>Watch the checks run</h3>
              <p>
                Handshakes, certificates, DNS, mail, page scripts and certificate
                logs report as each one finishes.
              </p>
            </li>
            <li>
              <span className="n">Step 03</span>
              <h3>Read the results, get the report</h3>
              <p>
                Score and fixes on screen straight away. Leave a work email for
                the signed PDF and CycloneDX file.
              </p>
            </li>
          </ol>

          <div className="vyu-facts" aria-label="Scan facts">
            <div>
              <b>21</b> key exchanges tested
            </div>
            <div>
              <b>Under 90</b> short connections to one host
            </div>
            <div>
              <b>About a minute</b> for a typical website
            </div>
            <div>
              <b>30 days</b> before results are deleted
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY YOU CAN RELY ON IT ── */}
      <section className="vyu-band paper" id="trust" aria-labelledby="trust-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">Why you can rely on it</p>
          <h2 className="vyu-h2" id="trust-title">
            Built to be checked, not taken on trust
          </h2>
          <p className="vyu-lead">
            Every number in a Vyu report traces back to a handshake, a DNS
            record, a published key or a line of code, and anyone can verify the
            report itself.
          </p>

          <div className="vyu-trust">
            <div className="vyu-tc">
              <p className="kicker">Engineering</p>
              <h3>Built from the handshake up</h3>
              <p>
                Vyu writes its own TLS handshake messages and offers each
                key-exchange group on its own, so it sees exactly what your server
                accepts, including groups an ordinary browser connection would
                never reveal.
              </p>
              <div className="vyu-probe" role="img" aria-label="21 groups probed">
                <i className="pq" />
                <i className="pq" />
                <i className="pq" />
                <i className="pq" />
                <i className="pq" />
                <i className="pq" />
                <i className="on" />
                <i className="on" />
                <i className="on" />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="vyu-wl">
                <span>
                  <i style={{ background: '#C49A45' }} />
                  Post-quantum groups
                </span>
                <span>
                  <i style={{ background: '#0E1B36' }} />
                  Accepted in sample
                </span>
                <span>
                  <i style={{ background: '#E5DCC9' }} />
                  Other classical & draft groups
                </span>
              </div>
            </div>

            <div className="vyu-tc">
              <p className="kicker">Method</p>
              <h3>A score you can audit</h3>
              <p>
                Five areas with fixed weights, printed in every report. Checks
                that were not run are left out of both sides, and the report shows
                the coverage.
              </p>
              <div
                className="vyu-weights"
                role="img"
                aria-label="Score weights breakdown"
              >
                <div style={{ flex: 35, background: '#0E1B36' }}>Key exchange 35</div>
                <div style={{ flex: 20, background: '#3A4A6E' }}>PKI 20</div>
                <div style={{ flex: 15, background: '#8A6522' }}>Ciphers 15</div>
                <div style={{ flex: 20, background: '#C49A45', color: '#0E1B36' }}>
                  Hygiene 20
                </div>
                <div style={{ flex: 10, background: '#D8C9A6', color: '#0E1B36' }}>
                  Web 10
                </div>
              </div>
              <div className="vyu-wl" style={{ marginTop: 10 }}>
                <span>Grades: A 85+, B 70–84, C 55–69, D 40–54, E below 40</span>
              </div>
            </div>

            <div className="vyu-tc">
              <p className="kicker">Standards</p>
              <h3>Standards, not opinions</h3>
              <p>
                Verdicts follow published guidance, and the inventory uses the
                format regulators already accept.
              </p>
              <div className="vyu-stds">
                <span>NIST FIPS 203 ML-KEM</span>
                <span>FIPS 204 ML-DSA</span>
                <span>FIPS 205 SLH-DSA</span>
                <span>NIST IR 8547 (draft)</span>
                <span>CycloneDX 1.7 CBOM</span>
                <span>CERT-In BOM guidelines v2.0</span>
                <span>CA/Browser Forum</span>
                <span>IETF hybrid TLS groups</span>
              </div>
            </div>

            <div className="vyu-tc">
              <p className="kicker">Proof</p>
              <h3>Reports you can verify</h3>
              <p>
                Every report and CBOM is signed by UElement. Anyone you share it
                with can confirm online that it is genuine and unchanged.
              </p>
              <div className="vyu-sig">
                report&nbsp;&nbsp;&nbsp;VYU-DEMO-WEB-STD (sample)
                <br />
                covers&nbsp;&nbsp;&nbsp;result, CBOM and PDF (SHA-256)
                <br />
                signed&nbsp;&nbsp;&nbsp;Ed25519 by UElement
                <br />
                <b>✓ signature valid, PDF matches the one issued</b>
              </div>
            </div>
          </div>

          <div className="vyu-safe">
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>Passive by design</b>
                A browser-like handshake, public DNS and public code. No exploits, no load.
              </span>
            </div>
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>No private networks</b>
                Targets that resolve to private or cloud-metadata addresses are refused.
              </span>
            </div>
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>Secrets stay secret</b>
                Secret values are never stored or shown. Locations go only to verified owners.
              </span>
            </div>
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>Polite on your servers</b>
                One connection at a time, with a pause between each.
              </span>
            </div>
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>Easy to recognise</b>
                Vyu names itself in its user agent, and owners can opt out of all scans.
              </span>
            </div>
            <div>
              <svg viewBox="0 0 16 16" width="18" height="18">
                <path d="M3 8.4l3.2 3.2L13 4.8" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>Short-lived data</b>
                Scan results are automatically deleted after 30 days.
              </span>
            </div>
          </div>

          <div className="vyu-team">
            <span className="vyu-tile" aria-hidden="true">92</span>
            <div>
              <h3>Made by U92 Quantum Security at UElement</h3>
              <p>
                Our team in Pune builds post-quantum discovery and migration
                tools. Our founders come from banking and financial services,
                telecom and global partner alliances, so the report speaks the
                language of the teams that have to act on it.
              </p>
            </div>
            <Link
              className="btn btn--glass"
              href="/support/demo/?product=U92-Vyu"
            >
              Talk to the team
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY NOW (REGULATORY TIMELINE) ── */}
      <section className="vyu-band dark" aria-labelledby="why-title">
        <div className="vyu-wrap vyu-why">
          <div>
            <p className="vyu-eyebrow">Why now</p>
            <h2 className="vyu-h2" id="why-title">
              The deadlines have started
            </h2>
            <p className="vyu-statement">
              An inventory comes first, and regulators are now asking for one.
            </p>
          </div>

          <ol className="vyu-tl">
            <li>
              <time dateTime="2025-07">July 2025</time>
              <p>
                CERT-In publishes its guidelines on SBOM, QBOM and CBOM, AIBOM and
                HBOM (version 2.0).
              </p>
            </li>
            <li className="now">
              <time dateTime="2026-12-31">End of 2026</time>
              <p>
                EU member states are asked to have cryptographic inventories in
                place.
              </p>
              <small>
                EU coordinated roadmap for transition to post-quantum cryptography
              </small>
            </li>
            <li>
              <time dateTime="2027-05-13">13 May 2027</time>
              <p>
                Most duties under India&apos;s DPDP Rules apply, including
                reasonable security safeguards and 72-hour breach reporting.
              </p>
            </li>
            <li>
              <time dateTime="2030">After 2030</time>
              <p>
                NIST proposes deprecating RSA-2048 and P-256; the EU expects
                high-risk systems to have moved to post-quantum cryptography.
              </p>
              <small>NIST IR 8547 (draft) and the EU roadmap</small>
            </li>
            <li>
              <time dateTime="2035">After 2035</time>
              <p>
                NIST proposes disallowing quantum-vulnerable public-key
                algorithms altogether.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ── COMPARE (FREE VS PAID) ── */}
      <section className="vyu-band paper" id="assure" aria-labelledby="assure-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">Free and paid</p>
          <h2 className="vyu-h2" id="assure-title">
            Start free with U92-Vyu. Go deeper with U92-VyuAssure.
          </h2>
          <p className="vyu-lead">
            Vyu is the free public check. VyuAssure is the paid, per-scan
            assessment for teams that must show evidence to a regulator, an
            auditor or a customer.
          </p>

          <div className="vyu-tablewrap">
            <table className="vyu-table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">
                    <div className="vyu-th-col">
                      <span className="vyu-th-title">U92-Vyu</span>
                      <span className="vyu-label vyu-lab-live">
                        <i aria-hidden="true" />
                        Live, free
                      </span>
                    </div>
                  </th>
                  <th scope="col">
                    <div className="vyu-th-col">
                      <span className="vyu-th-title">U92-VyuAssure</span>
                      <span className="vyu-label vyu-lab-build">
                        <i aria-hidden="true" />
                        In build, early access
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Post-quantum key exchange</th>
                  <td>Main host on its main port</td>
                  <td>Every subdomain and TLS port, SSH and mail servers, legacy protocol tests</td>
                </tr>
                <tr>
                  <th scope="row">Cryptographic inventory</th>
                  <td>CBOM of what the scan sees</td>
                  <td>Full CBOM and QBOM to CERT-In minimum elements, crypto-agility score, migration roadmap</td>
                </tr>
                <tr>
                  <th scope="row">Software components</th>
                  <td>Page scripts and repository dependencies with known CVEs</td>
                  <td>Full SBOM with transitive dependencies, exploit-likelihood ranking and VEX statements you confirm</td>
                </tr>
                <tr>
                  <th scope="row">Code</th>
                  <td>One public repository, secret counts only</td>
                  <td>Private repositories, secret locations and git history</td>
                </tr>
                <tr>
                  <th scope="row">Exposure</th>
                  <td className="dim">Passive checks only</td>
                  <td>Owner-approved external vulnerability assessment and performance checks</td>
                </tr>
                <tr>
                  <th scope="row">Regulation evidence</th>
                  <td className="dim">Not included</td>
                  <td>Evidence packs by regulator and country, with a guided questionnaire</td>
                </tr>
                <tr>
                  <th scope="row">Report</th>
                  <td>Signed summary PDF and CycloneDX file</td>
                  <td>Full signed report, CycloneDX and SPDX files, Excel tracker, re-scan within 30 days</td>
                </tr>
                <tr>
                  <th scope="row">Price</th>
                  <td>Free, work email for the report</td>
                  <td>Per scan, paid by UPI including Google Pay, card or invoice</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="vyu-packs-row">
            <div>
              <h3>Evidence packs in VyuAssure</h3>
              <p>
                Each pack maps scan results to the controls a regulator asks
                about, adds a short questionnaire for what a scan cannot see, and
                gives you a gap list and a plan. Reports state the evidence found;
                they never claim compliance.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 24, alignItems: 'center' }}>
                <Link
                  className="btn btn--metal"
                  href="/contact/?product=U92-VyuAssure"
                >
                  Request early access
                </Link>
                <Link
                  className="btn btn--line"
                  href="/support/demo/?product=U92-Vyu"
                  style={{ color: '#0E1B36', borderColor: 'rgba(14, 27, 54, 0.35)' }}
                >
                  Book a walkthrough →
                </Link>
              </div>
            </div>

            <div className="vyu-packs" aria-label="Planned evidence packs">
              {[
                'RBI IT Governance Master Direction',
                'SEBI CSCRF',
                'IRDAI Cyber Security Guidelines',
                'CERT-In Directions and BOM guidelines',
                'DPDP Act and Rules',
                'GDPR',
                'EU DORA',
                'NIS2',
                'PCI DSS v4.0',
                'HIPAA',
                'ISO 27001',
                'NIST CSF 2.0',
                'CNSA 2.0',
                'MAS TRM',
                'SAMA',
                'APRA CPS 234',
              ].map((pack) => (
                <span key={pack}>{pack}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AFTER THE SCAN (JOURNEY) ── */}
      <section className="vyu-band deep" aria-labelledby="journey-title">
        <div className="vyu-wrap">
          <p className="vyu-eyebrow">After the scan</p>
          <h2 className="vyu-h2" id="journey-title">
            One scan is the first step of a migration
          </h2>
          <p className="vyu-lead">
            U92 Quantum covers the whole path, from a free look at your public
            surface to moving each application onto post-quantum cryptography.
          </p>

          <div className="vyu-journey">
            <div className="vyu-jc">
              <span className="step">Step 01: See</span>
              <h3>U92-Vyu</h3>
              <p>A free check of one public host or repository, with a signed summary and CBOM.</p>
              <span className="vyu-label vyu-lab-live">
                <i aria-hidden="true" />
                Live, free
              </span>
            </div>
            <div className="vyu-jc">
              <span className="step">Step 02: Prove</span>
              <h3>U92-VyuAssure</h3>
              <p>Every endpoint, a full SBOM with VEX, and evidence packs for your regulators.</p>
              <span className="vyu-label vyu-lab-build">
                <i aria-hidden="true" />
                In build, early access
              </span>
            </div>
            <div className="vyu-jc">
              <span className="step">Step 03: Discover</span>
              <h3>U92-DeepVyu</h3>
              <p>Internal services, private code, HSMs and key stores, in one signed inventory with a costed plan.</p>
              <span className="vyu-label vyu-lab-eng">
                <i aria-hidden="true" />
                By engagement
              </span>
            </div>
            <div className="vyu-jc">
              <span className="step">Step 04: Migrate</span>
              <h3>U92-PQc</h3>
              <p>Applications moved to ML-KEM and ML-DSA one at a time, with crypto-agility built in.</p>
              <span className="vyu-label vyu-lab-eng">
                <i aria-hidden="true" />
                By engagement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="vyu-band creme" id="faq" aria-labelledby="faq-title">
        <div className="vyu-wrap">
          <h2 className="vyu-h2" id="faq-title">Questions</h2>

          <div className="vyu-faq">
            <details>
              <summary>Is it really free?</summary>
              <p>
                Yes. The scan and the results on screen are free, with no
                account. The signed PDF and CycloneDX file are free too; we ask
                for a work email so the report reaches the organisation it
                describes. U92-VyuAssure is the paid, per-scan assessment.
              </p>
            </details>
            <details>
              <summary>Will the scan affect my website?</summary>
              <p>
                No more than a handful of visitors would. Vyu makes short,
                browser-like connections to one host, one at a time with a pause
                between each, reads public DNS and certificate logs, and stops.
                Nothing is logged into or attacked.
              </p>
            </details>
            <details>
              <summary>Can I scan a site I do not own?</summary>
              <p>
                You confirm you are authorised before each scan. The free scan
                reads only what any visitor can see, but scanning someone
                else&apos;s systems may still need their permission. Deeper checks
                in VyuAssure always require proof of ownership.
              </p>
            </details>
            <details>
              <summary>What does &ldquo;post-quantum key exchange&rdquo; mean?</summary>
              <p>
                Hybrid groups such as X25519MLKEM768 combine today&apos;s
                elliptic-curve key exchange with ML-KEM, the NIST standard FIPS
                203. If either part holds, recorded traffic stays private.
                Browsers already offer it, so turning it on at your server or CDN
                protects most visitors at once.
              </p>
            </details>
            <details>
              <summary>Why is my score low when my certificate is valid?</summary>
              <p>
                A valid certificate proves identity today. The score weighs key
                exchange most, because that is what protects recorded traffic.
                Every finding shows how it was established and how the points were
                counted.
              </p>
            </details>
            <details>
              <summary>What is a CBOM?</summary>
              <p>
                A cryptographic bill of materials: a list of every algorithm,
                key, certificate and protocol a system relies on, with where it
                was found. It is the first step in any post-quantum migration,
                and both the CERT-In and EU guidance ask for one.
              </p>
            </details>
            <details>
              <summary>What happens to my data?</summary>
              <p>
                Scan results are kept for 30 days so you can come back to them,
                then deleted. If you request the report, we keep your name and
                work email to send it and, if you agree, to follow up. Secret
                values found in code are never stored.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ── CLOSING SECTION ── */}
      <section className="vyu-band vyu-closing" aria-labelledby="close-title">
        <div className="vyu-wrap">
          <div>
            <h2 className="vyu-h2" id="close-title">
              See what your server says in about a minute.
            </h2>
            <p>
              Free, passive and signed. Every post-quantum plan starts with
              knowing where you stand.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--metal"
            onClick={scrollToScanbox}
          >
            Check my readiness
          </button>
        </div>
      </section>

      {/* ── SCANNER MODAL ── */}
      <VyuScannerModal />
    </div>
  );
}
