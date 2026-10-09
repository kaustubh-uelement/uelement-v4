import Link from 'next/link';
import { HeroRing, HeroSparks } from '@/components/HeroRing';
import { Icon, type IconName } from '@/components/Icon';
import { Chip, SectionHead, ArrowLink } from '@/components/ui';
import { company } from '@/lib/site';
import { founders, beliefs, commitments } from '@/lib/content';

const whatWeDo: { icon: IconName; title: string; text: string; href: string; link: string }[] = [
  {
    icon: 'key',
    title: 'Quantum security',
    text: 'Helping banks and critical infrastructure stay secure as quantum computing changes cryptography.',
    href: '/platforms/u92-quantum/',
    link: 'U92 Quantum',
  },
  {
    icon: 'layers',
    title: 'Enterprise data and AI',
    text: 'Giving businesses one clear view of their digital presence, operations and compliance.',
    href: '/platforms/u92-enterprise/',
    link: 'U92 Enterprise',
  },
  {
    icon: 'mesh',
    title: 'Sovereign edge',
    text: 'Researching resilient, offline-capable AI and networks for places where connectivity fails.',
    href: '/platforms/u92-deeptech/',
    link: 'U92 Deeptech',
  },
];

const commitIcons: IconName[] = ['shield', 'eye', 'leaf', 'people', 'star'];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="panel panel--deep hero" aria-labelledby="hero-title">
        <HeroSparks />
        <div className="wrap hero__inner">
          <div className="hero-seq" style={{ ['--i' as string]: 0 } as React.CSSProperties}>
            <span className="proof">
              <span className="proof__faces" aria-hidden="true">
                {founders.map((f) => (
                  <span className="medal" key={f.initials}>
                    {f.initials}
                  </span>
                ))}
              </span>
              <span className="proof__text">
                <strong>Built in India, deployable anywhere.</strong> Founded by engineers from VMware, Ericsson and IIT Bombay.
              </span>
            </span>
          </div>
          <h1 id="hero-title" className="display hero__title hero-seq" style={{ ['--i' as string]: 1 } as React.CSSProperties}>
            {company.tagline}
          </h1>
          <p className="lede hero__lede hero-seq" style={{ ['--i' as string]: 2 } as React.CSSProperties}>
            UElement is a DeepTech company from Pune, India. We build frontier technology that keeps the systems societies run on safe, and helps this
            planet recover.
          </p>
          <div className="actions hero__actions hero-seq" style={{ ['--i' as string]: 3 } as React.CSSProperties}>
            <Link className="btn btn--metal" href="/contact/">
              Talk to us
            </Link>
            <Link className="btn btn--glass" href="/company/mission/">
              Read our mission
            </Link>
          </div>
        </div>
        <div className="hero__stage">
          <HeroRing />
          <div className="hero__horizon hero-seq" style={{ ['--i' as string]: 6 } as React.CSSProperties}>
            <p className="hero__statement">{company.statement}</p>
            <p className="hero__motto" lang="hi">
              {company.devanagari}
            </p>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="panel panel--paper section" aria-labelledby="who">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="people">Who we are</Chip>
              <h2 id="who" className="h2">
                Not just a company. An aggregation of thoughts.
              </h2>
            </div>
            <div className="prose muted" style={{ fontSize: 18 }}>
              <p>
                UElement is a shared mindset and one common goal we all want to walk towards. Anything once in ruins can be rebuilt. History shows it, our
                scriptures teach it, and our culture carries it. It starts with mindset.
              </p>
              <p>
                Some of the loudest visions of the future treat Earth as a place to leave behind. We disagree. The talent, capital and intelligence the
                world is building now are enough to repair what we have, if we choose to point them there.
              </p>
            </div>
          </div>

          <div className="founder-row">
            {founders.map((f) => (
              <div className="paper-card founder" key={f.name}>
                <span className="medal">{f.initials}</span>
                <span>
                  <span className="founder__name" style={{ display: 'block' }}>
                    {f.name}
                  </span>
                  <span className="founder__role">{f.role}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <ArrowLink href="/company/">About UElement</ArrowLink>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead chip="What we do" chipIcon="atom" title="We build frontier technology for the systems that cannot fail." />
          <div className="grid-3">
            {whatWeDo.map((w) => (
              <Link href={w.href} className="glass-card glass-card--pad card-link" key={w.title}>
                <span className="medal">
                  <Icon name={w.icon} />
                </span>
                <h3 className="h3" style={{ marginTop: 12 }}>
                  {w.title}
                </h3>
                <p className="muted">{w.text}</p>
                <span className="card-foot text-link">
                  {w.link}
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vision and mission */}
      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead chip="Vision and mission" chipIcon="compass" title="Where we want to go." />
          <div className="vm-grid">
            <article className="paper-card vm">
              <span className="vm__label" style={{ color: 'var(--gold-ink)' }}>
                Our vision
              </span>
              <p className="statement" style={{ fontSize: 'clamp(30px, 3.4vw, 46px)' }}>
                A future where humanity and technology progress together, and the planet grows healthier because of both.
              </p>
              <p className="muted">A future with no need for the words “global warming”, and no apocalyptic ending.</p>
            </article>
            <article className="metal-plate vm" style={{ borderRadius: 'var(--r-card)' }}>
              <span className="vm__label" style={{ color: '#4a3410' }}>
                Our mission
              </span>
              <p className="statement" style={{ fontSize: 'clamp(30px, 3.4vw, 46px)', color: '#2a1d05' }}>
                Build frontier technology that earns its place by leaving people and the planet better off, not just the balance sheet.
              </p>
              <Link className="btn btn--ink" href="/company/mission/" style={{ justifySelf: 'start' }}>
                Read the full mission
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="panel panel--creme section" aria-labelledby="beliefs">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
              <Chip icon="bulb">What we believe</Chip>
              <h2 id="beliefs" className="h2">
                We repair. We do not plan an exit.
              </h2>
            </div>
          </div>
          <div className="belief-list">
            {beliefs.map((b) => (
              <div className="belief" key={b.title}>
                <h3 className="h3">{b.title}</h3>
                <p className="muted">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead
            chip="Our commitments"
            chipIcon="star"
            title="Five commitments we will measure ourselves by."
            text="We will report on each of them honestly, once a year, with real numbers or none."
          />
          <ul className="commit-list">
            {commitments.map((c, i) => (
              <li className="glass-card commit" key={c.title}>
                <span className="medal medal--lg">
                  <Icon name={commitIcons[i]} />
                </span>
                <h3 className="h3">{c.title}</h3>
                <p className="muted" style={{ gridColumn: 'auto' }}>
                  {c.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Let's talk */}
      <section className="panel panel--paper section" aria-labelledby="talk">
        <div className="wrap" style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
            <Chip icon="chat">Let’s talk</Chip>
            <h2 id="talk" className="h2">
              Building something that cannot fail? We’d like to hear about it.
            </h2>
            <p className="lede muted">Every engagement starts with a small, fixed-scope first step, so you can judge our work before you commit to more.</p>
            <div className="actions">
              <Link className="btn btn--ink" href="/contact/">
                Talk to us
              </Link>
              <Link className="btn btn--line" href="/support/demo/">
                Book a demo
              </Link>
            </div>
          </div>
          <div className="grid" style={{ ['--gap' as string]: '12px' } as React.CSSProperties}>
            <a className="paper-card founder card-link" href={`mailto:${company.email}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="mail" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>
                  {company.email}
                </span>
                <span className="founder__role">Write to us about a project, a partnership or a role.</span>
              </span>
            </a>
            <a className="paper-card founder card-link" href={`tel:${company.phoneHref}`} style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="phone" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>
                  {company.phone}
                </span>
                <span className="founder__role">Call us to talk it through</span>
              </span>
            </a>
            <div className="paper-card founder">
              <span className="medal">
                <Icon name="pin" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>
                  {company.address}
                </span>
                <span className="founder__role">Working with customers globally</span>
              </span>
            </div>
            <Link className="paper-card founder card-link" href="/company/careers/" style={{ flexDirection: 'row' }}>
              <span className="medal">
                <Icon name="people" />
              </span>
              <span>
                <span className="founder__name" style={{ display: 'block' }}>
                  Want to build with us?
                </span>
                <span className="founder__role">We hire people who are brainy and by heart.</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
