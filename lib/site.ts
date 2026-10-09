// Company facts and navigation. Edit here; every page reads from this file.

export const company = {
  name: 'UElement Technologies Private Limited',
  short: 'UElement',
  tagline: 'Sovereign DeepTech systems for Resilient Enterprises.',
  statement: 'No Plan B. No Planet B.',
  devanagari: 'सशक्त · सक्षम · सुरक्षित',
  email: 'contact@uelement.in',
  phone: '+91 76206 90561',
  phoneHref: '+917620690561',
  address: 'Wakad, Pune, Maharashtra 411057, India',
  cin: 'U63990PN2026PTC251047',
  site: 'https://www.uelement.in',
  socials: {
    linkedin: 'https://www.linkedin.com/company/uelement-technologies/posts/?feedView=all',
    github: 'https://github.com/UElement',
    instagram: 'https://www.instagram.com/uelement_technologies/',
    twitter: 'https://x.com/uelement_tech',
  },
  // Set this to a form service URL (Formspree, Basin, your own API) to receive form posts.
  // While it is empty, forms open the visitor's email app with the message pre-filled.
  formEndpoint: '',
};

export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = { title: string; href?: string; links: NavLink[] };
export type NavMenu = { label: string; href: string; groups: NavGroup[]; columns?: number };

export const nav: NavMenu[] = [
  {
    label: 'Platforms',
    href: '/platforms/',
    groups: [
      {
        title: 'U92 Quantum',
        href: '/platforms/u92-quantum/',
        links: [
          { label: 'U92-Vyu', href: '/platforms/u92-quantum/vyu/', note: 'Cryptographic discovery' },
          { label: 'U92-PQc', href: '/platforms/u92-quantum/pqc/', note: 'Post-quantum migration' },
          { label: 'U92-CryptoAG', href: '/platforms/u92-quantum/cryptoag/', note: 'Crypto-agility' },
          { label: 'U92-QKD', href: '/platforms/u92-quantum/qkd/', note: 'Quantum key distribution' },
          { label: 'U92-QNet', href: '/platforms/u92-quantum/qnet/', note: 'Quantum-safe networking' },
          { label: 'U92-QML', href: '/platforms/u92-quantum/qml/', note: 'Quantum machine learning' },
        ],
      },
      {
        title: 'U92 Enterprise',
        href: '/platforms/u92-enterprise/',
        links: [
          { label: 'Nexus', href: '/platforms/u92-enterprise/nexus/', note: 'The enterprise digital fabric' },
          { label: 'Vizor', href: '/platforms/u92-enterprise/vizor/', note: 'Observability, security, compliance' },
          { label: 'Kayak', href: '/platforms/u92-enterprise/kayak/', note: 'Everything as a Service' },
        ],
      },
      {
        title: 'U92 Deeptech',
        href: '/platforms/u92-deeptech/',
        links: [
          { label: 'KalaMOS', href: '/platforms/u92-deeptech/kalamos/', note: 'Sovereign edge-AI OS' },
          { label: 'BoSC3', href: '/platforms/u92-deeptech/bosc3/', note: 'Agentic command and control' },
          { label: 'NobisGRID', href: '/platforms/u92-deeptech/nobisgrid/', note: 'Self-healing mesh' },
          { label: 'MagCHAIN', href: '/platforms/u92-deeptech/magchain/', note: 'Tamper-evident custody' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions/',
    groups: [
      {
        title: 'By need',
        links: [
          { label: 'Business Transformation', href: '/solutions/business-transformation/', note: 'Digital presence, portals, automation' },
          { label: 'Enterprise Security', href: '/solutions/enterprise-security/', note: 'Quantum-safe, observable, compliant' },
          { label: 'Edge AI', href: '/solutions/edge-ai/', note: 'Offline-capable AI and networks' },
        ],
      },
      {
        title: 'By industry',
        href: '/solutions/industries/',
        links: [
          { label: 'BFSI', href: '/solutions/industries/bfsi/' },
          { label: 'Capital Markets', href: '/solutions/industries/capital-markets/' },
          { label: 'Government & PSUs', href: '/solutions/industries/government-psus/' },
          { label: 'IT & Software', href: '/solutions/industries/it-software/' },
          { label: 'Healthcare & Pharma', href: '/solutions/industries/healthcare-pharma/' },
          { label: 'Satellite & Telecom', href: '/solutions/industries/satellite-telecom/' },
          { label: 'All 18 industries', href: '/solutions/industries/' },
        ],
      },
    ],
  },
  {
    label: 'Services',
    href: '/services/',
    groups: [
      {
        title: 'Services',
        links: [
          { label: 'Enterprise Security', href: '/services/enterprise-security/' },
          { label: 'Business Transformation', href: '/services/business-transformation/' },
          { label: 'Infrastructure', href: '/services/infrastructure/' },
          { label: 'Edge AI and Advisory', href: '/services/edge-ai-advisory/' },
          { label: 'Quantum Application Development & Consulting', href: '/services/quantum-applications/' },
        ],
      },
      {
        title: 'Engineering',
        links: [
          { label: 'SaaS Product Engineering', href: '/services/saas-engineering/' },
          { label: 'AI Application Development', href: '/services/ai-applications/' },
          { label: 'Telecom & Satellite Communication', href: '/services/telecom-satcom/' },
          { label: 'MVP Product Design & Prototyping', href: '/services/mvp-prototyping/' },
        ],
      },
    ],
  },
  {
    label: 'Why UElement',
    href: '/why-uelement/',
    groups: [
      {
        title: 'Why UElement',
        links: [
          { label: 'The UElement Advantage', href: '/why-uelement/advantage/', note: 'What changes when you work with us' },
          { label: 'Customer Success Stories', href: '/why-uelement/success-stories/', note: 'Real work, shared with permission' },
          { label: 'Research & Community', href: '/why-uelement/research/', note: 'Standards input, talks and writing' },
          { label: 'Corporate Social Responsibility', href: '/why-uelement/csr/', note: 'Digital literacy and skilling' },
          { label: 'Industry Recognition', href: '/why-uelement/recognition/', note: 'Awards, programmes and media' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    href: '/resources/',
    columns: 4,
    groups: [
      {
        title: 'Company',
        href: '/company/',
        links: [
          { label: 'About Us', href: '/company/' },
          { label: 'Careers', href: '/company/careers/' },
          { label: 'Our Mission', href: '/company/mission/' },
          { label: 'Investor Relations', href: '/company/investors/' },
          { label: 'Brand Guidelines', href: '/company/brand/' },
          { label: 'FAQs', href: '/company/faqs/' },
        ],
      },
      {
        title: 'Partnerships',
        href: '/partnerships/',
        links: [
          { label: 'UElement Partnerships', href: '/partnerships/' },
          { label: 'Become a Value Added Reseller', href: '/partnerships/value-added-reseller/' },
          { label: 'Form a Technology Alliance', href: '/partnerships/technology-alliance/' },
          { label: 'Explore GTM Partnership', href: '/partnerships/gtm-partnership/' },
        ],
      },
      {
        title: 'Resource Center',
        href: '/resources/',
        links: [
          { label: 'Blogs', href: '/resources/blogs/' },
          { label: 'Webinars', href: '/resources/webinars/' },
          { label: 'Media Gallery', href: '/resources/media-gallery/' },
          { label: 'Newsroom', href: '/resources/newsroom/' },
          { label: 'Events', href: '/resources/events/' },
        ],
      },
      {
        title: 'Support & Services',
        href: '/support/',
        links: [
          { label: 'Knowledge Base', href: '/support/knowledge-base/' },
          { label: 'User Guides', href: '/support/user-guides/' },
          { label: 'Customer Portal', href: '/support/customer-portal/' },
          { label: 'Get Service Quote', href: '/support/service-quote/' },
          { label: 'Get Support Now', href: '/support/get-support/' },
          { label: 'Get Demo', href: '/support/demo/' },
          { label: 'Submit Suggestion', href: '/support/suggestion/' },
        ],
      },
    ],
  },
];
