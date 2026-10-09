'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nav, company } from '@/lib/site';
import { Icon } from './Icon';
import { Logo } from './ui';

const megaWidth: Record<string, number> = {
  Platforms: 1060,
  Solutions: 1060,
  Services: 1060,
  'Why UElement': 460,
  Resources: 1100,
};

const platformsData = [
  {
    id: 'u92-quantum',
    tabLabel: 'U92 Quantum',
    title: 'UElement Quantum',
    summary: 'Sovereign Quantum-safe security: from cryptographic inventory to post-quantum migration and crypto-agility.',
    ctaText: 'Explore Quantum →',
    ctaHref: '/platforms/u92-quantum/',
    products: [
      {
        code: 'Q · 01',
        badge: 'EARLY ACCESS',
        badgeType: 'gold' as const,
        title: 'Cryptographic Discovery',
        summary: 'Find every cryptographic lock, key, and certificate you depend on.',
        href: '/platforms/u92-quantum/vyu/',
      },
      {
        code: 'Q · 02',
        badge: 'PROOF-OF-CONCEPT',
        badgeType: 'gold' as const,
        title: 'Post-Quantum Cryptography',
        summary: 'Migration to NIST post-quantum standards without breaking operations.',
        href: '/platforms/u92-quantum/pqc/',
      },
      {
        code: 'Q · 03',
        badge: 'IN DEVELOPMENT',
        badgeType: 'blue' as const,
        title: 'Crypto-Agility',
        summary: 'Axis, Codex and Crucible: algorithm rotation via policy configuration.',
        href: '/platforms/u92-quantum/cryptoag/',
      },
      {
        code: 'Q · 04',
        badge: 'PLANNED 2027',
        badgeType: 'slate' as const,
        title: 'Quantum Key Distribution',
        summary: 'Physics-based key exchange with validated hardware partners.',
        href: '/platforms/u92-quantum/qkd/',
      },
      {
        code: 'Q · 05',
        badge: 'RESEARCH',
        badgeType: 'slate' as const,
        title: 'Quantum Networking',
        summary: 'Architectural studies for networks carrying entangled quantum states.',
        href: '/platforms/u92-quantum/qnet/',
      },
      {
        code: 'Q · 06',
        badge: 'RESEARCH',
        badgeType: 'slate' as const,
        title: 'Quantum Machine Learning',
        summary: 'Empirical benchmarks testing where quantum models surpass classical AI.',
        href: '/platforms/u92-quantum/qml/',
      },
    ],
  },
  {
    id: 'u92-enterprise',
    tabLabel: 'U92 Enterprise',
    title: 'UElement Enterprise',
    summary: 'Three products on one identity, one data layer and one audit trail.',
    ctaText: 'Explore Enterprise →',
    ctaHref: '/platforms/u92-enterprise/',
    products: [
      {
        code: 'E · 01',
        badge: 'LIVE',
        badgeType: 'green' as const,
        title: 'Nexus',
        summary: 'The enterprise digital fabric: web, apps, portals, workflows and AI.',
        href: '/platforms/u92-enterprise/nexus/',
      },
      {
        code: 'E · 02',
        badge: 'PILOT',
        badgeType: 'gold' as const,
        title: 'Vizor',
        summary: 'Observability, security and compliance fabric across IT and OT.',
        href: '/platforms/u92-enterprise/vizor/',
      },
      {
        code: 'E · 03',
        badge: 'IN BUILD',
        badgeType: 'blue' as const,
        title: 'Kayak',
        summary: 'Everything as a Service: turn physical assets and space into metered digital services.',
        href: '/platforms/u92-enterprise/kayak/',
      },
    ],
  },
  {
    id: 'u92-deeptech',
    tabLabel: 'U92 Deeptech',
    title: 'UElement Deeptech',
    summary: 'Sovereign, offline-capable AI and networks in places where connectivity fails.',
    ctaText: 'Explore Deeptech →',
    ctaHref: '/platforms/u92-deeptech/',
    products: [
      {
        code: 'D · 01',
        badge: 'DESIGNED',
        badgeType: 'slate' as const,
        title: 'KalaMOS',
        summary: 'Sovereign edge-AI operating system running locally with no cloud reliance.',
        href: '/platforms/u92-deeptech/kalamos/',
      },
      {
        code: 'D · 02',
        badge: 'DESIGNED',
        badgeType: 'slate' as const,
        title: 'BoSC3',
        summary: 'Agentic command and control coordinating field teams and autonomous nodes.',
        href: '/platforms/u92-deeptech/bosc3/',
      },
      {
        code: 'D · 03',
        badge: 'DESIGNED',
        badgeType: 'slate' as const,
        title: 'NobisGRID',
        summary: 'Self-healing decentralized mesh network that automatically reroutes around failures.',
        href: '/platforms/u92-deeptech/nobisgrid/',
      },
      {
        code: 'D · 04',
        badge: 'DESIGNED',
        badgeType: 'slate' as const,
        title: 'MagCHAIN',
        summary: 'Tamper-evident chain of custody and provenance ledger for critical assets.',
        href: '/platforms/u92-deeptech/magchain/',
      },
    ],
  },
];

const solutionsData = [
  {
    id: 'industries',
    tabLabel: 'For Industries',
    title: 'UElement for Industries',
    summary: 'Security and sovereign intelligence tuned for your industry.',
    ctaText: 'See All Industries →',
    ctaHref: '/solutions/industries/',
    gridCols: 4,
    items: [
      { title: 'BFSI', summary: 'Quantum-safe banking & RBI/SEBI compliant posture.', href: '/solutions/industries/bfsi/' },
      { title: 'Capital Markets', summary: 'Deterministic low-latency trading & zero-trust custody.', href: '/solutions/industries/capital-markets/' },
      { title: 'IT Software', summary: 'Digital fabric, identity federation & AI governance.', href: '/solutions/industries/it-software/' },
      { title: 'Healthcare & Pharma', summary: 'HIPAA/DPDP records & serialized drug provenance.', href: '/solutions/industries/healthcare-pharma/' },
      { title: 'Government & PSUs', summary: 'Sovereign cloud & CERT-In readiness.', href: '/solutions/industries/government-psus/' },
      { title: 'Aerospace & Defence', summary: 'Tactical DDIL autonomy & anti-jam mesh.', href: '/solutions/industries/aerospace-defence/' },
      { title: 'Manufacturing', summary: 'Purdue-native telemetry across 40+ OT protocols.', href: '/solutions/industries/manufacturing/' },
      { title: 'Startup & SMEs', summary: 'Rapid digital front door & elastic fabric.', href: '/solutions/industries/startups-smes/' },
      { title: 'Satellite & Telecom', summary: 'Space-to-ground QKD & resilient 5G mesh.', href: '/solutions/industries/satellite-telecom/' },
      { title: 'Energy & Gas', summary: 'SCADA security & critical grid telemetry.', href: '/solutions/industries/energy-gas/' },
      { title: 'Water & Public Infra', summary: 'Municipal SCADA security & IoT asset control.', href: '/solutions/industries/water-public-infra/' },
      { title: 'Datacenter', summary: 'Rack unit metering & custody telemetry.', href: '/solutions/industries/data-centres/' },
      { title: 'Retail & Ecommerce', summary: 'High-concurrency storefronts & fraud defense.', href: '/solutions/industries/retail-ecommerce/' },
      { title: 'Logistics & Supply Chain', summary: 'End-to-end custody tracking & yard automation.', href: '/solutions/industries/logistics-supply-chain/' },
      { title: 'Environment', summary: 'Emissions telemetry & sensor audit provenance.', href: '/solutions/industries/environment/' },
      { title: 'Agriculture', summary: 'Edge AI crop sensing & irrigation telemetry.', href: '/solutions/industries/agriculture/' },
      { title: 'Education', summary: 'Campus zero-trust identity & student privacy.', href: '/solutions/industries/education/' },
      { title: 'Consulting & Services', summary: 'Client portals, verified security posture & brand presence.', href: '/solutions/industries/consulting-services/' },
    ],
  },
  {
    id: 'business-transformation',
    tabLabel: 'For Business Transformation',
    title: 'Business Transformation',
    summary: 'Modernise how you sell, serve and operate, starting with everything your customers see.',
    ctaText: 'Explore Transformation →',
    ctaHref: '/solutions/business-transformation/',
    gridCols: 3,
    items: [
      { title: 'Digital Front Door', summary: 'Websites, SEO, GenAI search and mobile apps on one platform.', href: '/solutions/business-transformation/' },
      { title: 'Workflows & Automation', summary: 'Content workflows, agentic AI assistants and end-to-end business logic.', href: '/solutions/business-transformation/' },
      { title: 'Multi-Channel Portals', summary: 'Applicant tracking, partner, dealer and customer support portals.', href: '/solutions/business-transformation/' },
      { title: 'Brand & Social Management', summary: 'Social media, brand assets, and multi-agency governance.', href: '/solutions/business-transformation/' },
      { title: 'Unified Identity', summary: 'Single customer and partner sign-in layer across all properties.', href: '/solutions/business-transformation/' },
      { title: 'Operational Visibility', summary: 'One unified view of customer journeys, costs and analytics.', href: '/solutions/business-transformation/' },
    ],
  },
  {
    id: 'enterprise-security',
    tabLabel: 'For Enterprise Security',
    title: 'Enterprise Security',
    summary: 'Become quantum-safe, see every system and produce compliance evidence as you operate.',
    ctaText: 'Explore Security →',
    ctaHref: '/solutions/enterprise-security/',
    gridCols: 3,
    items: [
      { title: 'Cryptographic Inventory', summary: 'Build a CBOM to identify every vulnerable key, certificate and algorithm.', href: '/solutions/enterprise-security/' },
      { title: 'Post-Quantum Migration', summary: 'Migrate to NIST PQC standards with hybrid TLS and zero downtime.', href: '/solutions/enterprise-security/' },
      { title: 'Crypto-Agility', summary: 'Rotate algorithms via policy configuration rather than application rewrites.', href: '/solutions/enterprise-security/' },
      { title: 'Unified Observability', summary: 'Single telemetry fabric across 7 enterprise dimensions in IT and OT.', href: '/solutions/enterprise-security/' },
      { title: 'Automated Compliance', summary: 'Continuous evidence generation for RBI, SEBI CSCRF, CERT-In and DPDP.', href: '/solutions/enterprise-security/' },
      { title: 'xBOM On Demand', summary: 'Software, crypto, quantum and AI bills of materials generated automatically.', href: '/solutions/enterprise-security/' },
    ],
  },
  {
    id: 'edge-ai',
    tabLabel: 'For Edge AI',
    title: 'Edge AI',
    summary: 'AI and networks that keep working where connectivity fails. We turn the edge into the cloud.',
    ctaText: 'Explore Edge AI →',
    ctaHref: '/solutions/edge-ai/',
    gridCols: 3,
    items: [
      { title: 'Offline-Capable AI', summary: 'Light and Standard local OS builds running inference directly on edge devices.', href: '/solutions/edge-ai/' },
      { title: 'Agentic Field Ops', summary: 'Command & control coordinating teams and field machines with human oversight.', href: '/solutions/edge-ai/' },
      { title: 'Self-Healing Mesh', summary: 'Decentralized networks that automatically reroute links when nodes drop out.', href: '/solutions/edge-ai/' },
      { title: 'Tamper-Evident Custody', summary: 'Immutable audit ledgers tracking custody, provenance and sensor proof.', href: '/solutions/edge-ai/' },
      { title: 'Tactical DDIL Autonomy', summary: 'Built for disconnected, intermittent, and limited-bandwidth environments.', href: '/solutions/edge-ai/' },
      { title: 'Sensor Mesh Arrays', summary: 'Distributed environmental, agricultural and industrial grid telemetry.', href: '/solutions/edge-ai/' },
    ],
  },
];

const servicesData = {
  title: 'Managed & Engineering Services',
  summary: 'Sovereign deeptech, post-quantum defense, and autonomous edge intelligence engineered for your mission.',
  ctaText: 'Explore All Services →',
  ctaHref: '/services/',
  items: [
    {
      title: 'Enterprise Security',
      summary: 'Post-quantum migration, cryptographic inventory & zero-trust posture.',
      href: '/services/enterprise-security/',
    },
    {
      title: 'Business Transformation',
      summary: 'Modernize core platforms, automate workflows & unify legacy systems.',
      href: '/services/business-transformation/',
    },
    {
      title: 'Infrastructure',
      summary: 'Sovereign cloud, hybrid compute, HSM lifecycle & datacenter metering.',
      href: '/services/infrastructure/',
    },
    {
      title: 'Edge AI and Advisory',
      summary: 'Tactical DDIL model optimization, sensor integration & edge OS deployment.',
      href: '/services/edge-ai-advisory/',
    },
    {
      title: 'Quantum Application Development & Consulting',
      summary: 'PQC algorithm integration, QKD network planning & quantum readiness audits.',
      href: '/services/quantum-applications/',
    },
    {
      title: 'SaaS Product Engineering',
      summary: 'Full-stack multi-tenant architectures, digital front doors & scalable APIs.',
      href: '/services/saas-engineering/',
    },
    {
      title: 'AI Application Development',
      summary: 'Domain-specific fine-tuning, RAG pipelines, agentic orchestration & evaluation harnesses.',
      href: '/services/ai-applications/',
    },
    {
      title: 'Telecom & Satellite Communication',
      summary: 'Optical quantum links, space-to-ground key exchange & resilient mesh networks.',
      href: '/services/telecom-satcom/',
    },
    {
      title: 'MVP Product Design & Prototyping',
      summary: 'Rapid 0-to-1 prototype build, architecture validation & production-ready PoVs.',
      href: '/services/mvp-prototyping/',
    },
  ],
  footer: {
    heading: 'Looking for custom deeptech consulting or advisory?',
    subtext: 'Our deeptech architects and engineers are here to partner with your team.',
    ctaText: 'Schedule an Advisory Session',
    ctaHref: '/contact/',
  },
};

const resourcesData = [
  {
    title: 'Company',
    cards: [
      {
        title: 'Company',
        note: 'About us, mission and vision, founders',
        href: '/company/',
      },
      {
        title: 'Careers',
        note: 'Open roles, how we hire (brainy and by heart)',
        href: '/company/careers/',
      },
      {
        title: 'Investor Relations',
        note: 'Company facts, contact for investors',
        href: '/company/investors/',
      },
      {
        title: 'Brand Guidelines',
        note: 'Logos, colours, typography & assets',
        href: '/company/brand/',
      },
    ],
  },
  {
    title: 'Partnerships',
    cards: [
      {
        title: 'Partnerships',
        note: 'Perforce, miniOrange, Marma Security and other partners; how to partner',
        href: '/partnerships/',
      },
      {
        title: 'Value Added Reseller',
        note: 'Deliver quantum-safe & observable systems',
        href: '/partnerships/value-added-reseller/',
      },
      {
        title: 'Technology Alliance',
        note: 'Integrate with our platform & research',
        href: '/partnerships/technology-alliance/',
      },
      {
        title: 'GTM Partnership',
        note: 'Joint delivery & regional alliances',
        href: '/partnerships/gtm-partnership/',
      },
    ],
  },
  {
    title: 'Service & Support',
    cards: [
      {
        title: 'Service & Support',
        note: 'Raise a ticket, documentation, service hours',
        href: '/support/',
      },
      {
        title: 'Customer Portal',
        note: 'Manage deployments & support tickets',
        href: '/support/customer-portal/',
      },
      {
        title: 'Knowledge Base',
        note: 'Guides, architecture notes & FAQs',
        href: '/support/knowledge-base/',
      },
      {
        title: 'User Guides',
        note: 'Step-by-step product walkthroughs',
        href: '/support/user-guides/',
      },
    ],
  },
  {
    title: 'Blogs & Media',
    cards: [
      {
        title: 'Blogs & Media',
        note: 'Articles, talks, interviews, press kit',
        href: '/resources/blogs/',
      },
      {
        title: 'News Articles',
        note: 'Announcements and coverage',
        href: '/resources/media-gallery/',
      },
      {
        title: 'Webinars & Tech Talks',
        note: 'Deeptech sessions and recordings',
        href: '/resources/webinars/',
      },
    ],
  },
];

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
  const [activePlatformTab, setActivePlatformTab] = useState('u92-quantum');
  const [activeSolutionTab, setActiveSolutionTab] = useState('industries');
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

  const currentPlatform = platformsData.find((p) => p.id === activePlatformTab) || platformsData[0];
  const currentSolution = solutionsData.find((s) => s.id === activeSolutionTab) || solutionsData[0];

  return (
    <>
      <header
        className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}
        onPointerLeave={hoverClose}
      >
        <div
          className="site-header__pill"
          style={{
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          }}
        >
          <Logo />

          <nav aria-label="Main" className="nav-pills">
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
          </nav>

          <div className="header-actions">
            <Link className="btn btn--metal btn--sm header-cta" href="/support/demo/">
              Book a demo
            </Link>
            <button
              className="menu-btn"
              aria-label="Open menu"
              aria-expanded={drawer}
              aria-controls="drawer"
              onClick={() => setDrawer(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {nav.map((m) => {
          const id = `mega-${m.label.replace(/\W+/g, '-').toLowerCase()}`;
          const isPlatforms = m.label === 'Platforms';
          const isSolutions = m.label === 'Solutions';
          const isServices = m.label === 'Services';
          const isResources = m.label === 'Resources';
          const foot = megaFoot[m.label];
          const cols = m.columns ?? m.groups.length;

          return (
            <div
              key={m.label}
              id={id}
              className={`mega${isPlatforms ? ' mega--platforms' : ''}${isSolutions ? ' mega--solutions' : ''}${isServices ? ' mega--services' : ''}${isResources ? ' mega--resources' : ''}${open === m.label ? ' is-open' : ''}`}
              style={{
                ['--mega-w' as string]: `${megaWidth[m.label] ?? 860}px`,
                ['--cols' as string]: cols,
                backdropFilter: 'blur(32px) saturate(190%)',
                WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              } as React.CSSProperties}
              onPointerEnter={() => window.clearTimeout(closeTimer.current)}
              aria-hidden={open !== m.label}
              inert={open !== m.label ? true : undefined}
            >
              {isPlatforms ? (
                <div className="mega-platform">
                  {/* Top Header Label */}
                  <div className="mega-platform__header">
                    <span className="mega-platform__tag">PLATFORM & PRODUCTS</span>
                  </div>

                  {/* Body: Left Sidebar Tabs + Right Platform Content */}
                  <div className="mega-platform__body">
                    {/* Left Sidebar Tabs */}
                    <div className="mega-platform__tabs" role="tablist" aria-label="Platform selection">
                      {platformsData.map((plat) => {
                        const isActive = plat.id === activePlatformTab;
                        return (
                          <button
                            key={plat.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={`mega-platform__tab-btn${isActive ? ' is-active' : ''}`}
                            onClick={() => setActivePlatformTab(plat.id)}
                            onPointerEnter={() => setActivePlatformTab(plat.id)}
                          >
                            <span>{plat.tabLabel}</span>
                            <svg className="mega-platform__tab-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Main Content */}
                    <div className="mega-platform__content">
                      {/* Hero Banner Card */}
                      <div className="mega-platform__hero">
                        <div className="mega-platform__hero-info">
                          <h3 className="mega-platform__hero-title">{currentPlatform.title}</h3>
                          <p className="mega-platform__hero-desc">{currentPlatform.summary}</p>
                        </div>
                        <Link href={currentPlatform.ctaHref} className="btn btn--metal btn--sm mega-platform__hero-btn">
                          {currentPlatform.ctaText}
                        </Link>
                      </div>

                      {/* Products Grid */}
                      <div className="mega-platform__grid">
                        {currentPlatform.products.map((prod) => (
                          <Link key={prod.href} href={prod.href} className="mega-platform__card">
                            <div className="mega-platform__card-top">
                              <span className="mega-platform__card-code">{prod.code}</span>
                              <span className={`mega-platform__card-badge mega-platform__card-badge--${prod.badgeType}`}>
                                {prod.badge}
                              </span>
                            </div>
                            <h4 className="mega-platform__card-title">{prod.title}</h4>
                            <p className="mega-platform__card-summary">{prod.summary}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Links */}
                  <div className="mega-platform__footer">
                    <Link href="/platforms/u92-quantum/vyu/" className="mega-platform__footer-link">
                      CHECK YOUR QUANTUM EXPOSURE <Icon name="arrow" />
                    </Link>
                    <Link href="/platforms/u92-enterprise/nexus/" className="mega-platform__footer-link">
                      NEXUS PACKAGES & PRICING <Icon name="arrow" />
                    </Link>
                    <Link href="/platforms/" className="mega-platform__footer-link">
                      ALL PLATFORMS <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              ) : isSolutions ? (
                <div className="mega-platform">
                  {/* Top Header Label */}
                  <div className="mega-platform__header">
                    <span className="mega-platform__tag">SOLUTIONS & USE CASES</span>
                  </div>

                  {/* Body: Left Sidebar Tabs + Right Solution Content */}
                  <div className="mega-platform__body">
                    {/* Left Sidebar Tabs */}
                    <div className="mega-platform__tabs" role="tablist" aria-label="Solution area selection">
                      {solutionsData.map((sol) => {
                        const isActive = sol.id === activeSolutionTab;
                        return (
                          <button
                            key={sol.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={`mega-platform__tab-btn${isActive ? ' is-active' : ''}`}
                            onClick={() => setActiveSolutionTab(sol.id)}
                            onPointerEnter={() => setActiveSolutionTab(sol.id)}
                          >
                            <span>{sol.tabLabel}</span>
                            <svg className="mega-platform__tab-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Main Content */}
                    <div className="mega-platform__content">
                      {/* Hero Banner Card */}
                      <div className="mega-platform__hero">
                        <div className="mega-platform__hero-info">
                          <h3 className="mega-platform__hero-title">{currentSolution.title}</h3>
                          <p className="mega-platform__hero-desc">{currentSolution.summary}</p>
                        </div>
                        <Link href={currentSolution.ctaHref} className="btn btn--metal btn--sm mega-platform__hero-btn">
                          {currentSolution.ctaText}
                        </Link>
                      </div>

                      {/* Solutions / Industries Grid */}
                      <div className={`mega-solutions__grid${currentSolution.gridCols === 4 ? ' mega-solutions__grid--4' : ' mega-solutions__grid--3'}`}>
                        {currentSolution.items.map((item) => (
                          <Link key={item.href + item.title} href={item.href} className="mega-solutions__card">
                            <h4 className="mega-solutions__card-title">{item.title}</h4>
                            <p className="mega-solutions__card-summary">{item.summary}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Links */}
                  <div className="mega-platform__footer">
                    <Link href="/solutions/" className="mega-platform__footer-link">
                      SEE ALL SOLUTIONS <Icon name="arrow" />
                    </Link>
                    <Link href="/solutions/industries/" className="mega-platform__footer-link">
                      EXPLORE ALL 18 INDUSTRIES <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              ) : isServices ? (
                <div className="mega-services">
                  {/* Top Header Label */}
                  <div className="mega-platform__header">
                    <span className="mega-platform__tag">SERVICES</span>
                  </div>

                  {/* Hero Banner Card */}
                  <div className="mega-platform__hero">
                    <div className="mega-platform__hero-info">
                      <h3 className="mega-platform__hero-title">{servicesData.title}</h3>
                      <p className="mega-platform__hero-desc">{servicesData.summary}</p>
                    </div>
                    <Link href={servicesData.ctaHref} className="btn btn--metal btn--sm mega-platform__hero-btn">
                      {servicesData.ctaText}
                    </Link>
                  </div>

                  {/* 3-Column Services Grid */}
                  <div className="mega-services__grid">
                    {servicesData.items.map((srv) => (
                      <Link key={srv.href} href={srv.href} className="mega-services__card">
                        <h4 className="mega-services__card-title">{srv.title}</h4>
                        <p className="mega-services__card-summary">{srv.summary}</p>
                      </Link>
                    ))}
                  </div>

                  {/* Footer Advisory Callout */}
                  <div className="mega-services__footer">
                    <div className="mega-services__footer-text">
                      <h5 className="mega-services__footer-heading">{servicesData.footer.heading}</h5>
                      <p className="mega-services__footer-subtext">{servicesData.footer.subtext}</p>
                    </div>
                    <Link href={servicesData.footer.ctaHref} className="mega-services__footer-cta">
                      {servicesData.footer.ctaText} <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              ) : isResources ? (
                <div className="mega-resources">
                  {/* Top Header Label */}
                  <div className="mega-platform__header">
                    <span className="mega-platform__tag">RESOURCES & SUPPORT</span>
                  </div>

                  {/* 4 Columns Grid */}
                  <div className="mega-resources__grid">
                    {resourcesData.map((col) => (
                      <div key={col.title} className="mega-resources__col">
                        <h4 className="mega-resources__col-title">{col.title}</h4>
                        <div className="mega-resources__col-cards">
                          {col.cards.map((c) => (
                            <Link key={c.href + c.title} href={c.href} className="mega-resources__card">
                              <h5 className="mega-resources__card-title">{c.title}</h5>
                              <p className="mega-resources__card-note">{c.note}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Links */}
                  <div className="mega-platform__footer">
                    <Link href="/contact/" className="mega-platform__footer-link">
                      HAVE QUESTIONS? CONTACT OUR TEAM <Icon name="arrow" />
                    </Link>
                    <Link href="/support/demo/" className="mega-platform__footer-link">
                      BOOK A DEMO <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          );
        })}
      </header>

      <div
        id="drawer"
        className={`drawer${drawer ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!drawer ? true : undefined}
        style={{
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        }}
      >
        <div className="drawer__top">
          <Logo />
          <button
            className="menu-btn"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
            style={{
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            }}
          >
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
