import Link from 'next/link';
import { company } from '@/lib/site';
import { Logo } from './ui';

const cols: { title: string; links: [string, string][] }[] = [
  {
    title: 'Platforms',
    links: [
      ['U92 Quantum', '/platforms/u92-quantum/'],
      ['U92 Enterprise', '/platforms/u92-enterprise/'],
      ['U92 Deeptech', '/platforms/u92-deeptech/'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['Business Transformation', '/solutions/business-transformation/'],
      ['Enterprise Security', '/solutions/enterprise-security/'],
      ['Edge AI', '/solutions/edge-ai/'],
      ['Industries', '/solutions/industries/'],
      ['Services', '/services/'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About us', '/company/'],
      ['Why UElement', '/why-uelement/'],
      ['Careers', '/company/careers/'],
      ['Partnerships', '/partnerships/'],
      ['Investor relations', '/company/investors/'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Support', '/support/'],
      ['Resources', '/resources/'],
      ['FAQs', '/company/faqs/'],
      ['Contact', '/contact/'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-statement">{company.statement}</p>
          </div>
          <nav className="footer-cols" aria-label="Footer">
            {cols.map((c) => (
              <div className="footer-col" key={c.title}>
                <h3>{c.title}</h3>
                <ul>
                  {c.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-contact">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
          <span>{company.address}</span>
        </div>

        <div className="footer-legal">
          <span>
            © 2026 {company.name}. CIN {company.cin}
          </span>
          <nav aria-label="Legal">
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
