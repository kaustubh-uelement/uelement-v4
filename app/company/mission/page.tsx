import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Chip } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our mission",
  description:
    "A promise is easy to make and easy to forget. So we have made ours in public, alongside eleven organisations that set the standard and hold us to it.",
  alternates: { canonical: "/company/mission/" },
};

export default function MissionPage() {
  return (
    <>
      {/* HERO */}
      <PageHero
        crumbs={[{ label: "Company", href: "/company/" }, { label: "Our mission" }]}
        chip="Our mission"
        chipIcon="spark"
        title={
          <>
            Technology that leaves people and the planet{" "}
            <span className="metal-text">better off.</span>
          </>
        }
        lede="A promise is easy to make and easy to forget. So we have made ours in public, alongside eleven organisations that set the standard and hold us to it. This page sets out what we are committed to or associated with, what we have joined, and how we will report on both."
      >
        <a className="btn btn--metal" href="#signed">
          What Matters to Us
        </a>
        <a className="btn btn--glass" href="#commitments">
          Our Commitments
        </a>
      </PageHero>

      {/* VISION / MISSION */}
      <section
        className="panel panel--paper section"
        aria-labelledby="why-title"
      >
        <div className="wrap">
          <div className="section-head">
            <div>
              <Chip icon="compass">Why we exist</Chip>
            </div>
            <h2 id="why-title" className="h2" style={{ marginTop: 12 }}>
              Where we want to go.
            </h2>
          </div>
          <div className="vm-grid">
            <div className="paper-card vm">
              <span className="vm__label" style={{ color: "var(--gold-ink)" }}>
                Our vision
              </span>
              <p
                className="statement"
                style={{ fontSize: "clamp(24px, 2.6vw, 36px)" }}
              >
                A future where humanity and technology progress together, and
                the planet grows healthier because of both.
              </p>
              <p className="muted">
                A future with no need for the words “global warming”, and no
                apocalyptic ending.
              </p>
            </div>
            <div
              className="metal-plate vm"
              style={{ borderRadius: "var(--r-card)" }}
            >
              <span className="vm__label" style={{ color: "#4a3410" }}>
                Our mission
              </span>
              <p
                className="statement"
                style={{
                  fontSize: "clamp(24px, 2.6vw, 36px)",
                  color: "#2a1d05",
                }}
              >
                Build frontier technology that earns its place by leaving people
                and the planet better off, not just the balance sheet.
              </p>
              <p style={{ color: "#4a3410", opacity: 0.88 }}>
                While the loudest voices look to abandon Earth, we believe
                humanity already has the talent, capital and intelligence to
                repair it. We only need to direct them with purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNED AND JOINED */}
      <section
        id="signed"
        className="panel panel--creme section"
        aria-labelledby="signed-title"
      >
        <div className="wrap">
          <div className="section-head section-head--split">
            <div
              className="stack"
              style={{ ["--stack" as string]: "16px" } as React.CSSProperties}
            >
              <span className="gold small" style={{ fontWeight: 600 }}>
                What we are committed-to or associated with
              </span>
              <h2 id="signed-title" className="h2">
                We would rather be held to account than admired.
              </h2>
            </div>
            <p className="lede muted">
              Each organisation below sets a public standard. Joining means
              meeting it, reporting against it, and accepting scrutiny when we
              fall short.
            </p>
          </div>

          {/* Group 1: For the planet */}
          <div className="lg-group">
            <div className="lg-group__head">
              <h3 className="h3">For the planet</h3>
              <p className="muted">
                Cutting our own emissions, building software that wastes less,
                and supporting the work of restoring nature.
              </p>
            </div>
            <div className="grid-3">
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/climate-pledge.webp"
                    alt="The Climate Pledge logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">The Climate Pledge</h4>
                    <span className="status status--line">Signatory</span>
                  </div>
                  <p className="small muted">
                    Net-zero carbon by 2040, through regular reporting, real
                    cuts in emissions, and credible offsets only for what
                    remains.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    className="is-tall"
                    src="/images/mission/wwf.webp"
                    alt="WWF logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">WWF</h4>
                    <span className="status status--line">Partner</span>
                  </div>
                  <p className="small muted">
                    Supporting WWF’s work to protect and restore nature, the
                    system every other system depends on.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/green-software-foundation.webp"
                    alt="Green Software Foundation logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">Green Software Foundation</h4>
                    <span className="status status--line">Member</span>
                  </div>
                  <p className="small muted">
                    Software that emits less: carbon-aware design, and measuring
                    the footprint of what we ship.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/finops-foundation.webp"
                    alt="FinOps Foundation logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">FinOps Foundation</h4>
                    <span className="status status--line">Member</span>
                  </div>
                  <p className="small muted">
                    Making cloud spend and resource use visible and accountable,
                    so waste can be seen and cut.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/open-planet.webp"
                    alt="Open Planet logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">Open Planet</h4>
                    <span className="placeholder">Relationship</span>
                  </div>
                  <p className="small muted">
                    Free environmental footage and data that help us tell the
                    climate story accurately.
                  </p>
                </div>
              </article>
            </div>
          </div>

          {/* Group 2: For people and responsible business */}
          <div className="lg-group">
            <div className="lg-group__head">
              <h3 className="h3">For people and responsible business</h3>
              <p className="muted">
                Human rights, fair work and clean dealing in how we run the
                company, measured against goals the whole world has agreed.
              </p>
            </div>
            <div className="grid-3">
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/un-global-compact.webp"
                    alt="United Nations Global Compact logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">UN Global Compact</h4>
                    <span className="status status--line">Participant</span>
                  </div>
                  <p className="small muted">
                    Strategy and operations aligned with the Ten Principles on
                    human rights, labour, environment and anti-corruption, with
                    progress reported every year.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/un-sdgs.svg"
                    alt="Sustainable Development Goals logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">UN Sustainable Development Goals</h4>
                    <span className="status status--line">Aligned</span>
                  </div>
                  <p className="small muted">
                    The seventeen goals we measure our work against. Our seven
                    focus goals are set out below.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/wef.webp"
                    alt="World Economic Forum logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">World Economic Forum</h4>
                    <span className="placeholder">Relationship</span>
                  </div>
                  <p className="small muted">
                    Where public and private leaders work together on
                    cybersecurity, quantum technology and the energy transition.
                  </p>
                </div>
              </article>
            </div>
          </div>

          {/* Group 3: For secure, open technology */}
          <div className="lg-group">
            <div className="lg-group__head">
              <h3 className="h3">For secure, open technology</h3>
              <p className="muted">
                Open standards and open-source software that anyone can inspect,
                and a national mission to make India quantum-safe.
              </p>
            </div>
            <div className="grid-3">
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/linux-foundation.webp"
                    alt="The Linux Foundation logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">The Linux Foundation</h4>
                    <span className="status status--line">Member</span>
                  </div>
                  <p className="small muted">
                    Open, vendor-neutral foundations for the software our
                    platforms are built on, and a place to give back.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    src="/images/mission/openssf.webp"
                    alt="OpenSSF, Open Source Security Foundation logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">OpenSSF</h4>
                    <span className="status status--line">Member</span>
                  </div>
                  <p className="small muted">
                    Securing the open-source supply chain that every SBOM and
                    CBOM we produce depends on.
                  </p>
                </div>
              </article>
              <article className="paper-card lg">
                <div className="lg__art">
                  <img
                    className="is-tall"
                    src="/images/mission/national-quantum-mission.webp"
                    alt="National Quantum Mission logo"
                  />
                </div>
                <div className="lg__body">
                  <div className="lg__top">
                    <h4 className="h4">National Quantum Mission</h4>
                    <span className="placeholder">Relationship</span>
                  </div>
                  <p className="small muted">
                    Department of Science &amp; Technology, Government of India.
                    The national programme for quantum technologies, including
                    the May 2026 roadmap for a quantum-safe ecosystem.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <p className="small muted lg-note">
            Logos show UElement’s own signature, membership, participation or
            partnership, and are used under each organisation’s brand
            guidelines. They do not mean that any of these organisations
            endorses UElement or its products.
          </p>
        </div>
      </section>

      {/* COMMITMENTS */}
      <section
        id="commitments"
        className="panel panel--creme section"
        aria-labelledby="commit-title"
      >
        <div className="wrap">
          <div className="section-head section-head--split">
            <div
              className="stack"
              style={{ ["--stack" as string]: "16px" } as React.CSSProperties}
            >
              <span className="gold small" style={{ fontWeight: 600 }}>
                Our commitments
              </span>
              <h2 id="commit-title" className="h2">
                Five commitments we will measure ourselves by.
              </h2>
            </div>
          </div>
          <ol className="commit-list">
            <li className="paper-card commit">
              <span className="medal medal--lg">01</span>
              <h3 className="h3">Protect the systems societies run on</h3>
              <div>
                <p>
                  Banks, power, water, telecom and healthcare must keep working
                  through the quantum transition. We build to open, published
                  standards and help secure the open-source code everyone
                  depends on.
                </p>
                <p className="held">
                  <b>Held to it by</b> National Quantum Mission · OpenSSF · The
                  Linux Foundation
                </p>
              </div>
            </li>
            <li className="paper-card commit">
              <span className="medal medal--lg">02</span>
              <h3 className="h3">Help every system see its own footprint</h3>
              <div>
                <p>
                  You cannot reduce what you cannot see. We will make energy,
                  cost and resource use visible in what we build, not just
                  uptime.
                </p>
                <p className="held">
                  <b>Held to it by</b> Green Software Foundation · FinOps
                  Foundation
                </p>
              </div>
            </li>
            <li className="paper-card commit">
              <span className="medal medal--lg">03</span>
              <h3 className="h3">Cut waste in the physical economy</h3>
              <div>
                <p>
                  Every asset reused is one not manufactured. We help extend the
                  useful life of equipment, and we count our own emissions
                  against a net-zero target.
                </p>
                <p className="held">
                  <b>Held to it by</b> The Climate Pledge · WWF
                </p>
              </div>
            </li>
            <li className="paper-card commit">
              <span className="medal medal--lg">04</span>
              <h3 className="h3">Keep AI beside humanity</h3>
              <div>
                <p>
                  A human in the loop for every decision that matters, respect
                  for the rights of everyone our systems touch, and people
                  trained into frontier roles.
                </p>
                <p className="held">
                  <b>Held to it by</b> UN Global Compact · World Economic Forum
                </p>
              </div>
            </li>
            <li className="paper-card commit">
              <span className="medal medal--lg">05</span>
              <h3 className="h3">Be the proof, inside UElement</h3>
              <div>
                <p>
                  A company that preaches repair must practise it. Once a year
                  we publish one report against every commitment on this page.
                </p>
                <p className="held">
                  <b>Held to it by</b> UN Global Compact · The Climate Pledge ·
                  UN Sustainable Development Goals
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* SDGs */}
      <section
        className="panel panel--enamel section"
        aria-labelledby="sdg-title"
      >
        <div className="wrap">
          <div className="section-head section-head--split">
            <div
              className="stack"
              style={{ ["--stack" as string]: "16px" } as React.CSSProperties}
            >
              <span className="gold small" style={{ fontWeight: 600 }}>
                Sustainable Development Goals
              </span>
              <h2 id="sdg-title" className="h2">
                Seven goals where our work can move the needle.
              </h2>
            </div>
            <p className="lede muted">
              We support all seventeen. These are the seven where what we build
              and how we run the company can make a measurable difference.
            </p>
          </div>
          <ul className="sdg-grid" role="list">
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#C5192D" }}>
                4
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Quality education</h3>
                <p className="small muted">
                  Digital literacy and deeptech skilling, in schools and in our
                  own teams.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#A21942" }}>
                8
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Decent work and economic growth</h3>
                <p className="small muted">
                  Hiring people who are brainy and by heart, and training them
                  into frontier roles.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#FD6925" }}>
                9
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Industry, innovation and infrastructure</h3>
                <p className="small muted">
                  Quantum-safe, observable infrastructure for the systems that
                  cannot fail.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#BF8B2E" }}>
                12
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Responsible consumption and production</h3>
                <p className="small muted">
                  Reuse before replace: extending the working life of physical
                  assets.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#3F7E44" }}>
                13
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Climate action</h3>
                <p className="small muted">
                  Net zero by 2040 under The Climate Pledge, and footprint data
                  our customers can act on.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#00689D" }}>
                16
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Peace, justice and strong institutions</h3>
                <p className="small muted">
                  Secure, trustworthy systems for banks, markets and government.
                </p>
              </div>
            </li>
            <li className="glass-card sdg">
              <span className="sdg__num" style={{ background: "#19486A" }}>
                17
              </span>
              <div
                className="stack"
                style={{ ["--stack" as string]: "6px" } as React.CSSProperties}
              >
                <h3 className="h4">Partnerships for the goals</h3>
                <p className="small muted">
                  The organisations on this page, and every customer who builds
                  with us.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* BELIEFS */}
      <section
        className="panel panel--paper section"
        aria-labelledby="believe-title"
      >
        <div className="wrap">
          <div className="section-head">
            <span className="gold small" style={{ fontWeight: 600 }}>
              What we believe
            </span>
            <h2 id="believe-title" className="h2">
              We repair. We do not plan an exit.
            </h2>
          </div>
          <div className="belief-list">
            <div className="belief">
              <h3 className="h4">Mindset comes first</h3>
              <p className="muted">
                Every rebuild in history began with people who refused to accept
                ruin as final.
              </p>
            </div>
            <div className="belief">
              <h3 className="h4">Brainy and by heart</h3>
              <p className="muted">
                Intelligence without conscience is how the world got here. We
                hire, build and sell with both.
              </p>
            </div>
            <div className="belief">
              <h3 className="h4">AI beside humanity</h3>
              <p className="muted">
                The most capable intelligence ever built should work with
                people, under human judgement.
              </p>
            </div>
            <div className="belief">
              <h3 className="h4">Profit funds purpose</h3>
              <p className="muted">
                We must be profitable to last, but profit is the fuel, not the
                destination.
              </p>
            </div>
            <div className="belief">
              <h3 className="h4">Proof over promises</h3>
              <p className="muted">
                We claim only what we can show. Every product carries an honest
                maturity label.
              </p>
            </div>
            <div className="belief">
              <h3 className="h4">Sovereign by design</h3>
              <p className="muted">
                Built in India, deployable anywhere, owned and controlled by the
                people who use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE DECIDE */}
      <section
        className="panel panel--creme section"
        aria-labelledby="decide-title"
      >
        <div className="wrap">
          <div className="section-head section-head--split">
            <div
              className="stack"
              style={{ ["--stack" as string]: "16px" } as React.CSSProperties}
            >
              <span className="gold small" style={{ fontWeight: 600 }}>
                How we decide
              </span>
              <h2 id="decide-title" className="h2">
                Five questions before we build anything.
              </h2>
            </div>
            <p className="lede muted">
              If the answer to any of them is no, we do not take the work on.
            </p>
          </div>
          <ol className="q-list">
            <li>
              <span className="q-list__n">1</span>
              <p>Does it leave people or the planet measurably better off?</p>
            </li>
            <li>
              <span className="q-list__n">2</span>
              <p>Can we describe it in public without exaggeration?</p>
            </li>
            <li>
              <span className="q-list__n">3</span>
              <p>Do people keep the final say on the decisions that matter?</p>
            </li>
            <li>
              <span className="q-list__n">4</span>
              <p>
                Does it repair, protect or extend useful life, rather than
                extract?
              </p>
            </li>
            <li>
              <span className="q-list__n">5</span>
              <p>Will it fund the company sustainably?</p>
            </li>
          </ol>
        </div>
      </section>

      {/* REPORTING + CTA */}
      <section
        className="panel panel--deep section"
        aria-labelledby="report-title"
      >
        <div
          className="wrap wrap--narrow"
          style={{ display: "grid", gap: 26, justifyItems: "start" }}
        >
          <span className="gold small" style={{ fontWeight: 600 }}>
            How we will report
          </span>
          <h2 id="report-title" className="statement">
            Real numbers, <span className="metal-text">or none.</span>
          </h2>
          <p className="lede muted">
            Once a year we will publish one report: our UN Global Compact
            Communication on Progress, our progress under The Climate Pledge,
            and what we did against each commitment and goal on this page. Where
            we fall short, the report will say so.
          </p>
          <div className="actions">
            <Link className="btn btn--metal" href="/contact/">
              Build this with us
            </Link>
            <Link className="btn btn--glass" href="/company/careers/">
              Join the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
