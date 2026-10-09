import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="panel panel--enamel page-hero">
      <div className="wrap page-hero__inner">
        <h1 className="h1">This page does not exist.</h1>
        <p className="lede muted">The link may be old, or the page may have moved when we rebuilt the site.</p>
        <div className="actions">
          <Link className="btn btn--metal" href="/">
            Go to the home page
          </Link>
          <Link className="btn btn--glass" href="/contact/">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
