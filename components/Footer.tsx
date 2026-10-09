import Link from 'next/link';
import { company } from '@/lib/site';
import { Logo } from './ui';
import { Icon } from './Icon';

interface FooterLinkItem {
  label: string;
  href: string;
  desc: string;
}

const cols: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: 'Platforms',
    links: [
      { label: 'U92 Quantum', href: '/platforms/u92-quantum/', desc: 'Quantum-safe security & PQC' },
      { label: 'U92 Enterprise', href: '/platforms/u92-enterprise/', desc: 'Observability & digital fabric' },
      { label: 'U92 Deeptech', href: '/platforms/u92-deeptech/', desc: 'Sovereign edge AI & mesh' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Business Transformation', href: '/solutions/business-transformation/', desc: 'Front doors & automation' },
      { label: 'Enterprise Security', href: '/solutions/enterprise-security/', desc: 'CBOM & compliance evidence' },
      { label: 'Edge AI', href: '/solutions/edge-ai/', desc: 'Offline-capable intelligence' },
      { label: 'Industries', href: '/solutions/industries/', desc: 'Tailored for 18 sectors' },
      { label: 'Services', href: '/services/', desc: 'Advisory & engineering' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/company/', desc: 'Mission, vision & founders' },
      { label: 'Why UElement', href: '/why-uelement/', desc: 'Proof over promises' },
      { label: 'Careers', href: '/company/careers/', desc: 'Brainy and by heart' },
      { label: 'Partnerships', href: '/partnerships/', desc: 'Alliances & VAR network' },
      { label: 'Investor relations', href: '/company/investors/', desc: 'Facts & governance' },
      { label: 'Brand guidelines', href: '/company/brand/', desc: 'Logos, colors & assets' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Support', href: '/support/', desc: 'Tickets & service hours' },
      { label: 'Resources', href: '/resources/', desc: 'Blogs, media & webinars' },
      { label: 'FAQs', href: '/company/faqs/', desc: 'Frequently asked questions' },
      { label: 'Contact', href: '/contact/', desc: 'Reach our team' },
    ],
  },
];

const socialLinks = [
  { name: 'linkedin' as const, label: 'LinkedIn', href: company.socials?.linkedin || 'https://www.linkedin.com/company/uelement/' },
  { name: 'github' as const, label: 'GitHub', href: company.socials?.github || 'https://github.com/uelement' },
  { name: 'instagram' as const, label: 'Instagram', href: company.socials?.instagram || 'https://www.instagram.com/uelement.in/' },
  { name: 'twitter' as const, label: 'Twitter / X', href: company.socials?.twitter || 'https://x.com/uelement_in' },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-statement">{company.statement}</p>
            <div className="footer-socials" aria-label="Social media">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label={s.label}
                >
                  <Icon name={s.name} />
                </a>
              ))}
            </div>
          </div>
          <nav className="footer-cols" aria-label="Footer">
            {cols.map((c) => (
              <div className="footer-col" key={c.title}>
                <h3>{c.title}</h3>
                <ul>
                  {c.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link">
                        <span className="footer-link__label">{link.label}</span>
                        <span className="footer-link__desc">{link.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-contact">
          <div className="footer-contact__info">
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
            <span>{company.address}</span>
          </div>
          <div className="footer-motto" lang="hi">
            {company.devanagari}
          </div>
        </div>

        <div className="footer-legal">
          <span>
            © 2026 {company.name} | All Rights Reserved | CIN {company.cin}
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
