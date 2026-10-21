import Link from "next/link";
import type { Metadata } from "next";
import { HeroRing, HeroSparks } from "@/components/HeroRing";
import { Icon, type IconName } from "@/components/Icon";
import { Chip, SectionHead, ArrowLink } from "@/components/ui";
import { RestrictedButton } from "@/components/RestrictedModal";
import { company } from "@/lib/site";
import { beliefs, commitments } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    absolute:
      "UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises",
  },
  description:
    "Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.",
  openGraph: {
    title:
      "UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises",
    description:
      "Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.",
    url: "https://uelement.co/",
    siteName: "UElement Technologies",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UElement Technologies — Sovereign DeepTech systems for Resilient Enterprises",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "UElement Technologies | Sovereign DeepTech systems for Resilient Enterprises",
    description:
      "Quantum-safe security, an Enterprise Data Plane and Sovereign Edge AI for the systems that cannot Fail. Built in Pune, Deployable Anywhere.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://uelement.co/",
  },
};

const whatWeDo: {
  icon: IconName;
  title: string;
  text: string;
  href: string;
  link: string;
}[] = [
  {
    icon: "key",
    title: "Quantum security",
    text: "Helping banks and critical infrastructure stay secure as quantum computing changes cryptography.",
    href: "/platforms/u92-quantum/",
    link: "U92 Quantum",
  },
  {
    icon: "layers",
    title: "Enterprise data and AI",
    text: "Giving businesses one clear view of their digital presence, operations and compliance.",
    href: "/platforms/u92-enterprise/",
    link: "U92 Enterprise",
  },
  {
    icon: "mesh",
    title: "Sovereign edge",
    text: "Researching resilient, offline-capable AI and networks for places where connectivity fails.",
    href: "/platforms/u92-deeptech/",
    link: "U92 Deeptech",
  },
];

const commitIcons: IconName[] = ["shield", "eye", "leaf", "people", "star"];

const heroPillBadges = [
  { label: "Deeptech", href: "/platforms/u92-deeptech/" },
  { label: "Enterprise", href: "/platforms/u92-enterprise/" },
  { label: "Quantum", href: "/platforms/u92-quantum/" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="panel panel--deep hero" aria-labelledby="hero-title">
        <HeroSparks />
        <div className="wrap hero__inner">
          <div
            className="hero-seq hero__proof-wrap"
            style={{ ["--i" as string]: 0 } as React.CSSProperties}
          >
            <span className="proof">
              <span
                className="proof__faces"
                aria-label="Platforms: Deeptech, Enterprise, Quantum"
              >
                {heroPillBadges.map((b) => {
                  const isRestricted =
                    b.label === "Deeptech" || b.href.includes("u92-deeptech");
                  return isRestricted ? (
                    <RestrictedButton
                      className="proof__badge"
                      key={b.label}
                      title={b.label}
                      aria-label={b.label}
                    >
                      <span className="proof__badge-label">{b.label}</span>
                    </RestrictedButton>
                  ) : (
                    <Link
                      href={b.href}
                      className="proof__badge"
                      key={b.label}
                      title={b.label}
                      aria-label={b.label}
                    >
                      <span className="proof__badge-label">{b.label}</span>
                    </Link>
                  );
                })}
              </span>
              <span className="proof__text">
                <strong className="proof__title">
                  Built in India, deployable anywhere.
                </strong>{" "}
                <span className="proof__subtitle">
                  Developed by engineers from VMware, Ericsson, COEP & IIT
                  Bombay.
                </span>
              </span>
            </span>
          </div>
          <h1
            id="hero-title"
            className="display hero__title hero-seq"
            style={{ ["--i" as string]: 1 } as React.CSSProperties}
          >
            {company.tagline}
          </h1>
          <p
            className="lede hero__lede hero-seq"
            style={{ ["--i" as string]: 2 } as React.CSSProperties}
          >
            Rooted in Purpose. Built to Protect.
          </p>
          <div
            className="actions hero__actions hero-seq"
            style={{ ["--i" as string]: 3 } as React.CSSProperties}
          >
            <Link className="btn btn--metal" href="/contact/">
              Contact Us
            </Link>
            <Link className="btn btn--glass" href="/company/mission/">
              Our Mission
            </Link>
          </div>
        </div>
        <div className="hero__stage">
          <HeroRing />
        </div>
      </section>

      {/* Who we are */}
      <section className="panel panel--paper section" aria-labelledby="who">
        <div className="wrap">
          <div
            className="section-head section-head--split"
            style={{ rowGap: 28 }}
          >
            <div
              style={{
                display: "grid",
                gap: 18,
                justifyItems: "start",
                alignSelf: "start",
              }}
            >
              <Chip icon="people">Who We Are</Chip>
              <h2 id="who" className="h2">
                Building <span className="metal-text">DeepTech</span>,
                Quantum-safe security solutions &amp; Enterprise platforms for
                critical Infrastructure.
              </h2>
            </div>
            <div
              className="prose muted"
              style={{ fontSize: 18, maxWidth: "none" }}
            >
              <p>
                at UElement,{" "}
                <em>We are driven by a shared Mindset and a singular Goal;</em>{" "}
                to rebuild and fortify what matters. History, culture and our
                deepest traditions teach us that anything broken can be
                restored. While the loudest voices today look to abandon Earth
                for the future, we believe differently.
              </p>
              <blockquote className="quote-callout">
                <p className="quote-callout__text">
                  <span className="quote-callout__mark">“</span>Humanity already
                  possesses the Talent, Capital and Intelligence required to
                  repair our world, We simply need to Direct it with Purpose.
                  <span className="quote-callout__mark">”</span>
                </p>
              </blockquote>
            </div>
            <div
              className="prose muted"
              style={{
                gridColumn: "1 / -1",
                fontSize: 18,
                maxWidth: "none",
                lineHeight: 1.6,
              }}
            >
              <p>
                That purpose drives our Technology. Our{" "}
                <em>U92 Quantum Security</em> platform equips BFSI and critical
                infrastructure with post-quantum cryptography to protect systems
                that cannot fail. Alongside it, our{" "}
                <em>U92 Enterprise Fabric</em> platform empowers growing
                businesses with the intelligent solutions they need to
                confidently scale their digital operations.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <ArrowLink href="/company/">About UElement</ArrowLink>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="panel panel--enamel section">
        <div className="wrap">
          <SectionHead
            chip="What We Do"
            chipIcon="atom"
            title="We build frontier technology for the systems that cannot fail."
          />
          <div className="grid-3">
            {whatWeDo.map((w) => {
              const isRestricted = w.href.includes("u92-deeptech");
              return isRestricted ? (
                <RestrictedButton
                  className="glass-card glass-card--pad card-link card-link--disabled"
                  style={{
                    textAlign: "left",
                    font: "inherit",
                    width: "100%",
                  }}
                  key={w.title}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span className="medal">
                      <Icon name={w.icon} />
                    </span>
                    <h3 className="h3" style={{ margin: 0 }}>
                      {w.title}
                    </h3>
                  </div>
                  <p className="muted">{w.text}</p>
                  <span className="card-foot text-link">
                    {w.link}
                    <Icon name="arrow" />
                  </span>
                </RestrictedButton>
              ) : (
                <Link
                  href={w.href}
                  className="glass-card glass-card--pad card-link"
                  key={w.title}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span className="medal">
                      <Icon name={w.icon} />
                    </span>
                    <h3 className="h3" style={{ margin: 0 }}>
                      {w.title}
                    </h3>
                  </div>
                  <p className="muted">{w.text}</p>
                  <span className="card-foot text-link">
                    {w.link}
                    <Icon name="arrow" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision and mission */}
      <section className="panel panel--paper section">
        <div className="wrap">
          <SectionHead
            chip="Vision and Mission"
            chipIcon="compass"
            title="Where we want to go."
          />
          <div className="vm-grid">
            <article className="paper-card vm">
              <span className="vm__label" style={{ color: "var(--gold-ink)" }}>
                Our Vision
              </span>
              <p
                className="statement"
                style={{
                  fontFamily:
                    '"Noto Sans", "Noto Sans Devanagari", var(--font-sans)',
                  fontStyle: "italic",
                  fontSize: "clamp(18px, 1.6vw, 23px)",
                  lineHeight: 1.45,
                }}
              >
                A future where humanity and technology progress together, and
                the planet grows healthier because of both.
              </p>
              <p className="muted" style={{ marginTop: "auto" }}>
                A future with no need for the words “global warming”, and no
                apocalyptic ending.
              </p>
            </article>
            <article
              className="metal-plate vm"
              style={{ borderRadius: "var(--r-card)" }}
            >
              <span className="vm__label" style={{ color: "#4a3410" }}>
                Our Mission
              </span>
              <p
                className="statement"
                style={{
                  fontFamily:
                    '"Noto Sans", "Noto Sans Devanagari", var(--font-sans)',
                  fontStyle: "italic",
                  fontSize: "clamp(18px, 1.6vw, 23px)",
                  lineHeight: 1.45,
                  color: "#2a1d05",
                }}
              >
                Build frontier technology that earns its place by leaving people
                and the planet better off, not just the balance sheet.
              </p>
              <Link
                className="btn btn--ink"
                href="/company/mission/"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                Read the full Mission
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="panel panel--creme section" aria-labelledby="beliefs">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div style={{ display: "grid", gap: 18, justifyItems: "start" }}>
              <Chip icon="bulb">What We Believe</Chip>
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
            chip="Our Commitments"
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
                <p className="muted">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Let's talk */}
      <section className="panel panel--paper section" aria-labelledby="talk">
        <div className="wrap talk-grid">
          <div style={{ display: "grid", gap: 22, justifyItems: "start" }}>
            <Chip icon="chat">Let’s Talk</Chip>
            <h2 id="talk" className="h2">
              Building something that cannot fail? We’d like to hear about it.
            </h2>
            <p className="lede muted">
              Every engagement starts with a small, fixed-scope first step, so
              you can judge our work before you commit to more.
            </p>
            <div className="actions">
              <Link className="btn btn--ink" href="/contact/">
                Talk to Us
              </Link>
              <Link className="btn btn--line" href="/support/demo/">
                Book a Demo
              </Link>
            </div>
          </div>
          <div
            className="grid"
            style={{ ["--gap" as string]: "12px" } as React.CSSProperties}
          >
            <a
              className="paper-card founder card-link"
              href={`mailto:${company.email}`}
              style={{ flexDirection: "row" }}
            >
              <span className="medal">
                <Icon name="mail" />
              </span>
              <span>
                <span className="founder__name" style={{ display: "block" }}>
                  {company.email}
                </span>
                <span className="founder__role">
                  For projects, partnerships or roles.
                </span>
              </span>
            </a>
            <a
              className="paper-card founder card-link"
              href="https://wa.me/917620690561"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flexDirection: "row" }}
            >
              <span className="medal">
                <Icon name="whatsapp" />
              </span>
              <span>
                <span className="founder__name" style={{ display: "block" }}>
                  {company.phone}
                </span>
                <span className="founder__role">
                  WhatsApp us to talk it through
                </span>
              </span>
            </a>
            <div className="paper-card founder">
              <span className="medal">
                <Icon name="pin" />
              </span>
              <span>
                <span className="founder__name" style={{ display: "block" }}>
                  {company.address}
                </span>
                <span className="founder__role">
                  Working with customers globally
                </span>
              </span>
            </div>
            <Link
              className="paper-card founder card-link"
              href="/company/careers/"
              style={{ flexDirection: "row" }}
            >
              <span className="medal">
                <Icon name="people" />
              </span>
              <span>
                <span className="founder__name" style={{ display: "block" }}>
                  Want to build with us?
                </span>
                <span className="founder__role">
                  We hire brainy and by heart.
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
