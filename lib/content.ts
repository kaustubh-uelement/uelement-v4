// All page content lives here, so copy can change without touching layouts.
// Status labels follow UElement's rule: every product carries an honest maturity label.

export type Status = 'Live' | 'Available' | 'Pilot' | 'In build' | 'Planned' | 'Research' | 'Designed';

export type Product = {
  slug: string;
  name: string;
  short: string;
  status: Status;
  summary: string;
  capabilities: { title: string; text: string }[];
  forWho: string;
  start: { title: string; text: string };
  notes?: string;
};

export type Platform = {
  slug: string;
  name: string;
  alias: string;
  short: string;
  summary: string;
  promise: string;
  products: Product[];
};

export const platforms: Platform[] = [
  {
    slug: 'u92-quantum',
    name: 'U92 Quantum',
    alias: 'UElement Quantum',
    short: 'Quantum computing and security',
    summary:
      'Data stolen today can be decrypted once a capable quantum computer exists. U92 Quantum finds your vulnerable cryptography, moves it to post-quantum standards and keeps you able to change algorithms as the field moves.',
    promise: 'Find every key before an attacker does.',
    products: [
      {
        slug: 'vyu',
        name: 'U92-Vyu',
        short: 'Cryptographic discovery',
        status: 'Available',
        summary:
          'Vyu scans your code, certificates, TLS endpoints and APIs and builds a cryptographic bill of materials (CBOM): every key, certificate and algorithm you depend on, and how exposed each one is.',
        capabilities: [
          { title: 'Find', text: 'Scans source code, certificates, TLS configurations and APIs for cryptographic use.' },
          { title: 'Flag', text: 'Marks RSA, ECC and other algorithms that a quantum computer will break.' },
          { title: 'Rank', text: 'Orders findings by how long the protected data has to stay secret.' },
          { title: 'Report', text: 'Exports a CBOM your auditors, regulators and buyers can read.' },
        ],
        forWho: 'Banks, insurers, government bodies and software vendors who need an inventory before they can plan a migration.',
        start: { title: 'Quantum readiness scan', text: 'One application, fixed scope, a ranked findings report and a migration roadmap.' },
      },
      {
        slug: 'pqc',
        name: 'U92-PQc',
        short: 'Post-quantum migration',
        status: 'Pilot',
        summary:
          'PQc moves your systems to the NIST post-quantum standards, one application at a time, with hybrid TLS so classical and quantum-safe cryptography run side by side during the transition.',
        capabilities: [
          { title: 'Standards', text: 'ML-KEM, ML-DSA and SLH-DSA, published by NIST as FIPS 203, 204 and 205.' },
          { title: 'Hybrid first', text: 'Hybrid key exchange keeps today’s clients working while you migrate.' },
          { title: 'Planned', text: 'An application-by-application plan built from your Vyu inventory.' },
          { title: 'BFSI-ready', text: 'Shaped around Indian banking, insurance and payments requirements.' },
        ],
        forWho: 'Banks, insurers, fintechs and critical-infrastructure operators facing India’s 2029 quantum-safe deadline.',
        start: { title: 'Paid proof of concept', text: 'Migrate one application end to end and measure the effect before you scale.' },
      },
      {
        slug: 'cryptoag',
        name: 'U92-CryptoAG',
        short: 'Crypto-agility',
        status: 'In build',
        summary:
          'CryptoAG lets you change algorithms by policy instead of by rewrite, so the next cryptographic change is a setting, not a project.',
        capabilities: [
          { title: 'Axis', text: 'One abstraction layer between your applications and their crypto libraries.' },
          { title: 'Codex', text: 'A registry and policy control plane for approved algorithms.' },
          { title: 'Crucible', text: 'Rotation drills that prove you can switch algorithms safely.' },
          { title: 'Evidence', text: 'Records that show auditors your crypto-agility in practice.' },
        ],
        forWho: 'Organisations that have started PQC migration and want to avoid doing it twice.',
        start: { title: 'Crypto-agility design review', text: 'We map where algorithm changes would hurt today and what it takes to fix that.' },
      },
      {
        slug: 'qkd',
        name: 'U92-QKD',
        short: 'Quantum key distribution',
        status: 'Planned',
        summary:
          'QKD uses the physics of light to share encryption keys. We are building the integration layer with research and hardware partners, starting with the links that matter most.',
        capabilities: [
          { title: 'Design', text: 'Selecting the links where QKD adds real protection over PQC alone.' },
          { title: 'Integrate', text: 'Feeding QKD keys into your existing key management.' },
          { title: 'Partner', text: 'Hardware partners, with research ties to IISc Bengaluru and the Raman Research Institute.' },
          { title: 'Roadmap', text: 'First integrations targeted for 2027.' },
        ],
        forWho: 'Defence, government, telecom and banking backbones that will run PQC and QKD together.',
        start: { title: 'QKD briefing', text: 'A plain-language session on where QKD fits your network.' },
      },
      {
        slug: 'qnet',
        name: 'U92-QNet',
        short: 'Quantum-safe networking',
        status: 'Research',
        summary: 'QNet aims to give you one key-management plane across PQC and QKD links, with quantum random number generation.',
        capabilities: [
          { title: 'One plane', text: 'A single view of keys across classical, PQC and QKD links.' },
          { title: 'QRNG', text: 'Quantum random numbers where key quality matters most.' },
          { title: 'Simulation', text: 'Model a quantum-safe network before you build it.' },
        ],
        forWho: 'Telecom operators and large enterprises planning quantum-safe backbones.',
        start: { title: 'Research collaboration', text: 'Talk to us about joining as a design partner.' },
      },
      {
        slug: 'qml',
        name: 'U92-QML',
        short: 'Quantum machine learning',
        status: 'Research',
        summary: 'QML explores quantum and hybrid algorithms for risk, fraud and optimisation problems, running on partner quantum hardware.',
        capabilities: [
          { title: 'Hybrid', text: 'Quantum and classical steps in one workflow.' },
          { title: 'Use cases', text: 'Portfolio risk, fraud patterns and routing optimisation.' },
          { title: 'Hardware', text: 'Runs on partner quantum computers through the cloud.' },
        ],
        forWho: 'Research teams in banking, logistics and energy exploring quantum advantage.',
        start: { title: 'Research collaboration', text: 'Bring a problem; we will test whether quantum helps.' },
      },
    ],
  },
  {
    slug: 'u92-enterprise',
    name: 'U92 Enterprise',
    alias: 'UElement Enterprise',
    short: 'Unified enterprise data plane',
    summary:
      'Three products on one identity, one data layer and one audit trail. Nexus projects your business outward, Vizor watches everything digital, Kayak commands the physical. Add the next one without re-platforming.',
    promise: 'One data plane. Three products.',
    products: [
      {
        slug: 'nexus',
        name: 'Nexus',
        short: 'The enterprise digital fabric',
        status: 'Live',
        summary:
          'Nexus puts everything your customers, partners and candidates see on one platform: website, search, apps, portals and the workflows behind them. Switch on only the modules you need.',
        capabilities: [
          { title: 'Web and search', text: 'Websites, SEO and GenAI search, managed in one place.' },
          { title: 'Apps and identity', text: 'Mobile apps and customer sign-in with one identity layer.' },
          { title: 'Portals', text: 'Careers and applicant tracking, partner, training and support portals.' },
          { title: 'Workflows and AI', text: 'Content, workflows, agentic AI assistants and analytics.' },
          { title: 'Brand and social', text: 'Social media, brand and agency management with post-level reporting.' },
        ],
        forWho: 'Startups, SMEs and growing enterprises that want one platform instead of a dozen tools.',
        start: { title: 'Nexus packages', text: 'Starter (3 modules), Advance (6), Enterprise (12) and Large Enterprise (24), renewed yearly.' },
      },
      {
        slug: 'vizor',
        name: 'Vizor',
        short: 'Observability, security and compliance',
        status: 'Pilot',
        summary:
          'Vizor replaces separate monitoring, security and compliance tools with one fabric across IT and industrial OT: one data lake, one topology graph and one AI engine.',
        capabilities: [
          { title: 'Seven dimensions', text: 'Enterprise, applications, network, cloud, security, compliance and risk.' },
          { title: 'VizorIQ', text: 'Causal root cause, forward forecasts and a copilot that cites its evidence.' },
          { title: 'Compliance packs', text: 'RBI, SEBI CSCRF, CERT-In 6-hour reporting, DPDP and ISO 27001.' },
          { title: 'Vizor xBOM', text: 'Software, crypto, quantum and AI bills of materials on demand.' },
          { title: 'OT aware', text: 'Passive, Purdue-aware monitoring with IEC 62443 zones and conduits.' },
        ],
        forWho: 'Banks, government, manufacturers and data-centre operators who need one view of IT and OT.',
        start: { title: '45-day proof of value', text: 'Two-hour scoping, deployment on one critical journey by day 14, outcome review on day 45.' },
      },
      {
        slug: 'kayak',
        name: 'Kayak',
        short: 'Everything as a Service',
        status: 'In build',
        summary:
          'Kayak turns physical assets, inventory and space into metered, traceable services, with a 3D digital twin of the warehouse, data-centre hall or campus.',
        capabilities: [
          { title: 'Digital twin', text: 'A live 3D view of your site with assets, alerts and work orders.' },
          { title: 'Sensing', text: 'RFID and computer-vision identification working together.' },
          { title: 'Custody', text: 'A tamper-evident chain of custody, built on MagCHAIN.' },
          { title: 'Maintenance', text: 'Predictive maintenance that schedules work before failures.' },
        ],
        forWho: 'Data centres, warehouses and enterprise campuses.',
        start: { title: 'Single-site pilot', text: 'One site, a defined asset set and agreed measures.' },
        notes: 'Final product name to be confirmed.',
      },
    ],
  },
  {
    slug: 'u92-deeptech',
    name: 'U92 Deeptech',
    alias: 'UElement Deeptech',
    short: 'DeepEdge compute ecosystem',
    summary:
      'We don’t connect the edge to the cloud. We turn the edge into the cloud. U92 Deeptech is our research programme for sovereign, offline-capable AI and networks in places where connectivity fails.',
    promise: 'We turn the edge into the cloud.',
    products: [
      {
        slug: 'kalamos',
        name: 'KalaMOS',
        short: 'Sovereign edge-AI operating system',
        status: 'Designed',
        summary: 'KalaMOS runs AI on the device itself, in Light and Standard builds, with no dependence on a remote cloud. Named for Dr APJ Abdul Kalam.',
        capabilities: [
          { title: 'Local AI', text: 'Models run on edge hardware, online or offline.' },
          { title: 'Two builds', text: 'Light for small devices, Standard for edge servers.' },
          { title: 'Sovereign', text: 'No external dependency for updates or inference.' },
        ],
        forWho: 'Energy, environment monitoring and defence programmes with remote sites.',
        start: { title: 'Design partnership', text: 'Co-develop a first deployment with us.' },
      },
      {
        slug: 'bosc3',
        name: 'BoSC3',
        short: 'Agentic command and control',
        status: 'Designed',
        summary: 'BoSC3 coordinates people and machines in the field and is built to keep working as nodes drop out. Named for J.C. Bose and S.N. Bose.',
        capabilities: [
          { title: 'Coordination', text: 'Agentic planning across many field nodes.' },
          { title: 'Resilience', text: 'Designed to hold through heavy node loss.' },
          { title: 'Human in charge', text: 'People keep the final say on every consequential action.' },
        ],
        forWho: 'Disaster response, energy grids and public-safety operations.',
        start: { title: 'Design partnership', text: 'Co-develop a first deployment with us.' },
      },
      {
        slug: 'nobisgrid',
        name: 'NobisGRID',
        short: 'Self-healing mesh network',
        status: 'Designed',
        summary: 'NobisGRID is a decentralised mesh that reroutes itself when links fail, using stochastic path optimisation. Named for P.C. Mahalanobis.',
        capabilities: [
          { title: 'Self-healing', text: 'Finds a new path when a link fails.' },
          { title: 'Decentralised', text: 'No single point that can take the network down.' },
          { title: 'Sensor meshes', text: 'Built for forests, rivers, grids and remote corridors.' },
        ],
        forWho: 'Environment monitoring, energy and disaster-response networks.',
        start: { title: 'Design partnership', text: 'Co-develop a first deployment with us.' },
      },
      {
        slug: 'magchain',
        name: 'MagCHAIN',
        short: 'Tamper-evident custody and provenance',
        status: 'Designed',
        summary: 'MagCHAIN records who held an asset, where and when, in a ledger that shows any tampering. It also underpins Kayak.',
        capabilities: [
          { title: 'Custody', text: 'Every hand-off recorded with time, place and sensor proof.' },
          { title: 'Provenance', text: 'Answers “where did this come from” in one query.' },
          { title: 'Shared ledger', text: 'Partners see the same record.' },
        ],
        forWho: 'Pharma, defence supply chains, ports and logistics.',
        start: { title: 'Design partnership', text: 'Co-develop a first deployment with us.' },
      },
    ],
  },
];

export const statusTone: Record<Status, 'gold' | 'line' | 'dash'> = {
  Live: 'gold',
  Available: 'gold',
  Pilot: 'line',
  'In build': 'line',
  Planned: 'dash',
  Research: 'dash',
  Designed: 'dash',
};

// ---------- Industries ----------
export type Industry = {
  slug: string;
  name: string;
  summary: string;
  needs: string[];
  areas: ('business-transformation' | 'enterprise-security' | 'edge-ai')[];
  products: string[]; // product slugs
};

export const industries: Industry[] = [
  { slug: 'bfsi', name: 'BFSI', summary: 'Banks, insurers, NBFCs, payments and fintechs carry the longest-lived secrets and the strictest regulators.', needs: ['Quantum-safe payment paths before the 2029 deadline', 'UPI and core-banking journey observability', 'RBI and CERT-In evidence produced as you operate'], areas: ['enterprise-security', 'business-transformation'], products: ['vyu', 'pqc', 'vizor', 'nexus'] },
  { slug: 'capital-markets', name: 'Capital Markets', summary: 'Brokers, asset managers, exchanges and depositories run on speed, trust and SEBI oversight.', needs: ['SEBI CSCRF controls with continuous evidence', 'Uptime of trading and settlement journeys', 'Quantum-safe data in transit'], areas: ['enterprise-security'], products: ['vizor', 'pqc', 'vyu'] },
  { slug: 'it-software', name: 'IT & Software', summary: 'Software vendors selling to banks and government will be asked to prove what their products contain.', needs: ['SBOM and CBOM for every release', 'A quantum-readiness answer for customer questionnaires', 'Crypto-agile products that survive algorithm changes'], areas: ['enterprise-security', 'business-transformation'], products: ['vizor', 'vyu', 'cryptoag'] },
  { slug: 'healthcare-pharma', name: 'Healthcare & Pharma', summary: 'Hospitals, diagnostics and pharma hold sensitive records and run systems that cannot stop.', needs: ['DPDP-ready consent and access control', 'Clinical system uptime and ransomware visibility', 'Patient and partner portals'], areas: ['enterprise-security', 'business-transformation'], products: ['vizor', 'nexus', 'magchain'] },
  { slug: 'government-psus', name: 'Government & PSUs', summary: 'Public bodies need sovereign technology that meets national security rules and serves citizens well.', needs: ['India’s PQC timeline for critical infrastructure', 'CERT-In 6-hour incident reporting', 'Citizen portals on sovereign infrastructure'], areas: ['enterprise-security', 'business-transformation'], products: ['vyu', 'pqc', 'vizor', 'nexus'] },
  { slug: 'aerospace-defence', name: 'Aerospace & Defence', summary: 'Operations that must continue when networks are jammed, cut or denied.', needs: ['Air-gapped and offline-first systems', 'Quantum-safe communications', 'Tamper-evident supply chains'], areas: ['edge-ai', 'enterprise-security'], products: ['kalamos', 'nobisgrid', 'magchain', 'pqc'] },
  { slug: 'manufacturing', name: 'Manufacturing', summary: 'Plants where IT and operational technology meet, and downtime costs real money.', needs: ['Passive OT visibility across Purdue levels', 'Faster root cause on the plant floor', 'Dealer, distributor and support portals'], areas: ['enterprise-security', 'business-transformation', 'edge-ai'], products: ['vizor', 'nexus', 'kayak'] },
  { slug: 'startups-smes', name: 'Startups & SMEs', summary: 'Growing businesses that need a professional digital presence without a dozen subscriptions.', needs: ['Website, search and apps on one platform', 'Portals and workflows as the team grows', 'Pricing that matches the stage you are at'], areas: ['business-transformation'], products: ['nexus'] },
  { slug: 'satellite-telecom', name: 'Satellite & Telecom', summary: 'Networks that carry everyone else’s data and must be secured for the quantum decade.', needs: ['Quantum-safe core and signalling links', 'Network observability across sites', 'Resilient links for remote coverage'], areas: ['enterprise-security', 'edge-ai'], products: ['pqc', 'qkd', 'vizor', 'nobisgrid'] },
  { slug: 'energy-gas', name: 'Energy & Gas', summary: 'Grids, plants and pipelines spread across remote sites with critical control systems.', needs: ['OT and SCADA security monitoring', 'Critical-infrastructure PQC deadline', 'Local decisions at remote sites'], areas: ['enterprise-security', 'edge-ai'], products: ['vizor', 'pqc', 'kalamos', 'nobisgrid'] },
  { slug: 'water-public-infra', name: 'Water & Public Infra', summary: 'Utilities that communities depend on every hour of the day.', needs: ['Control-system visibility', 'Compliance evidence for regulators', 'Sensor networks for leaks and quality'], areas: ['enterprise-security', 'edge-ai'], products: ['vizor', 'nobisgrid'] },
  { slug: 'data-centres', name: 'Data Centres', summary: 'Operators who host everyone else and need to prove they are secure and efficient.', needs: ['Multi-tenant observability and FinOps', 'Rack, power and asset visibility', 'PQC for hosted customers'], areas: ['enterprise-security', 'business-transformation'], products: ['vizor', 'kayak', 'pqc'] },
  { slug: 'retail-ecommerce', name: 'Retail & E-commerce', summary: 'Brands selling across regions, channels and currencies.', needs: ['Multi-region storefronts and catalogues', 'Social and influencer management', 'Payment and checkout reliability'], areas: ['business-transformation'], products: ['nexus', 'vizor'] },
  { slug: 'logistics-supply-chain', name: 'Logistics & Supply Chain', summary: 'Goods moving through many hands, where custody and visibility matter.', needs: ['Asset and inventory visibility', 'Tamper-evident hand-offs', 'Networks that work along remote routes'], areas: ['edge-ai', 'business-transformation'], products: ['kayak', 'magchain', 'nobisgrid'] },
  { slug: 'environment', name: 'Environment Ecosystem', summary: 'Forests, rivers and coasts that need watching where no network reaches.', needs: ['Sensor meshes without fixed infrastructure', 'Early warning for fire, flood and pollution', 'Local AI that runs offline'], areas: ['edge-ai'], products: ['nobisgrid', 'kalamos'] },
  { slug: 'agriculture', name: 'Agriculture', summary: 'Farms and agri-businesses working with patchy connectivity.', needs: ['Field sensors and irrigation monitoring', 'Offline crop and soil analysis', 'Traceable produce from farm to buyer'], areas: ['edge-ai'], products: ['nobisgrid', 'kalamos', 'magchain'] },
  { slug: 'education', name: 'Education', summary: 'Institutes and edtech platforms serving students, staff and partners.', needs: ['Admissions, course and certification portals', 'Careers portals for placements', 'Student data protection under DPDP'], areas: ['business-transformation'], products: ['nexus'] },
  { slug: 'consulting-services', name: 'Consulting & Services', summary: 'Firms whose reputation rests on their clients’ data and their own digital presence.', needs: ['Client portals and knowledge workflows', 'Security posture clients can verify', 'A brand presence that matches the work'], areas: ['business-transformation', 'enterprise-security'], products: ['nexus', 'vizor'] },
];

// ---------- Solution areas ----------
export type SolutionArea = {
  slug: 'business-transformation' | 'enterprise-security' | 'edge-ai';
  name: string;
  summary: string;
  promise: string;
  outcomes: { title: string; text: string }[];
  products: string[];
  industries: string[];
  maturity?: string;
};

export const solutionAreas: SolutionArea[] = [
  {
    slug: 'business-transformation',
    name: 'Business Transformation',
    summary: 'Modernise how you sell, serve and operate, starting with everything your customers see.',
    promise: 'One platform for everything your customers, partners and candidates see.',
    outcomes: [
      { title: 'Fewer tools', text: 'Website, search, apps and portals on one platform.' },
      { title: 'Faster launches', text: 'Switch on a module instead of buying another product.' },
      { title: 'Clearer operations', text: 'One view of journeys, cost and performance.' },
    ],
    products: ['nexus', 'vizor', 'kayak'],
    industries: ['startups-smes', 'bfsi', 'healthcare-pharma', 'education', 'manufacturing', 'it-software', 'retail-ecommerce', 'government-psus', 'data-centres', 'consulting-services'],
  },
  {
    slug: 'enterprise-security',
    name: 'Enterprise Security',
    summary: 'Become quantum-safe, see every system and produce compliance evidence as you operate.',
    promise: 'Quantum-safe, observable and compliant, on your own terms.',
    outcomes: [
      { title: 'Know your exposure', text: 'A cryptographic inventory of every key and certificate.' },
      { title: 'Migrate in order', text: 'Post-quantum migration, most sensitive systems first.' },
      { title: 'Prove it daily', text: 'Regulatory evidence generated by operations, not audit season.' },
    ],
    products: ['vyu', 'pqc', 'cryptoag', 'vizor'],
    industries: ['bfsi', 'capital-markets', 'it-software', 'government-psus', 'satellite-telecom', 'energy-gas', 'water-public-infra', 'manufacturing', 'healthcare-pharma', 'data-centres', 'consulting-services'],
  },
  {
    slug: 'edge-ai',
    name: 'Edge AI',
    summary: 'AI and networks that keep working where connectivity fails.',
    promise: 'We turn the edge into the cloud.',
    outcomes: [
      { title: 'Work offline', text: 'Models and decisions run on site, without a cloud link.' },
      { title: 'Survive failure', text: 'Networks that reroute themselves when links drop.' },
      { title: 'Trust the record', text: 'Tamper-evident custody for assets and payloads.' },
    ],
    products: ['kalamos', 'bosc3', 'nobisgrid', 'magchain'],
    industries: ['aerospace-defence', 'energy-gas', 'environment', 'logistics-supply-chain', 'manufacturing', 'agriculture', 'satellite-telecom', 'water-public-infra'],
    maturity: 'U92 Deeptech is at design stage. We are looking for design partners in energy, environment and public infrastructure.',
  },
];

// ---------- Services ----------
export type Service = { slug: string; name: string; summary: string; includes: string[]; start: string; products: string[]; via?: string };

export const services: Service[] = [
  { slug: 'enterprise-security', name: 'Enterprise Security', summary: 'From cryptographic inventory to quantum-safe migration and continuous compliance.', includes: ['Quantum readiness assessment with a CBOM', 'xBOM reports: SBOM, CBOM, QBOM and AI-BOM', 'PQC migration and proofs of concept', 'Vizor rollout and compliance evidence'], start: 'Quantum readiness scan', products: ['vyu', 'pqc', 'vizor'] },
  { slug: 'business-transformation', name: 'Business Transformation', summary: 'A digital presence and the workflows behind it, delivered on Nexus.', includes: ['Website design, build and management', 'Mobile apps and customer portals', 'Workflow and AI automation', 'Social, brand and agency management'], start: 'Nexus package plan', products: ['nexus'] },
  { slug: 'infrastructure', name: 'Infrastructure', summary: 'Data-centre build-outs and cloud migrations, delivered with specialist partners.', includes: ['Data-centre planning and setup', 'Cloud and virtualisation migration', 'Monitoring from day one with Vizor'], start: 'Scoping call', products: ['vizor'], via: 'Delivered with infrastructure partners.' },
  { slug: 'edge-ai-advisory', name: 'Edge AI and Advisory', summary: 'Plain-language briefings for boards and design partnerships for edge AI.', includes: ['Quantum-risk briefings for boards and CISOs', 'Edge AI design partnerships', 'Technology due diligence'], start: 'Board briefing', products: ['kalamos', 'nobisgrid'] },
  { slug: 'quantum-applications', name: 'Quantum Application Development & Consulting', summary: 'Quantum and hybrid algorithms built and tested on partner quantum hardware.', includes: ['Problem selection: where quantum might help', 'Hybrid algorithm development', 'Benchmarks against classical methods'], start: 'Feasibility workshop', products: ['qml'] },
  { slug: 'saas-engineering', name: 'SaaS Product Engineering', summary: 'Multi-tenant platforms designed, built and run by the team behind Nexus and Vizor.', includes: ['Architecture and multi-tenancy', 'Cloud-native build and DevOps', 'Security and compliance by design', 'Operations after launch'], start: 'Architecture review', products: ['nexus'] },
  { slug: 'ai-applications', name: 'AI Application Development', summary: 'Agentic AI, GenAI assistants and analytics that keep a human in charge.', includes: ['Agentic workflows with human approval', 'Assistants grounded in your own data', 'Analytics and forecasting'], start: 'Use-case workshop', products: ['nexus', 'vizor'] },
  { slug: 'telecom-satcom', name: 'Telecom & Satellite Communication', summary: 'Network and satellite communication engineering from architects with decades in telecom.', includes: ['Network architecture and integration', 'Quantum-safe links for operators', 'Observability across sites'], start: 'Architecture review', products: ['pqc', 'vizor'] },
  { slug: 'mvp-prototyping', name: 'MVP Product Design & Prototyping', summary: 'From an idea to a working prototype you can put in front of customers or investors.', includes: ['Product discovery and scope', 'UX and interface design', 'A working prototype', 'A plan for the full build'], start: 'Discovery sprint', products: [] },
];

// ---------- Company ----------
export const founders = [
  { initials: 'CG', name: 'Chaitanya Ghate', role: 'Co-founder & CMD', bio: 'Second-time founder. R&D at VMware and BMC BladeLogic, AT&T data-centre storage at Tech Mahindra, then principal architect.' },
  { initials: 'VJ', name: 'Vikalp Jambhulkar', role: 'Co-founder & CEO', bio: 'IIT Bombay and IIM Ahmedabad. Growth leader at PepsiCo, The Label Life and Switchcart Technologies.' },
  { initials: 'SS', name: 'Satrajit Sengupta', role: 'Co-founder & CTO', bio: 'NIT Durgapur. Sixteen years as a telecom architect at Ericsson; principal architect at Calsoft.' },
  { initials: 'KN', name: 'Kaustubh Narwade', role: 'Co-founder & CPO', bio: 'Joined as an intern and earned co-founder. Full-stack SaaS, cloud and DevOps; product owner for Vizor.' },
];

export const beliefs = [
  { title: 'Mindset comes first', text: 'Every rebuild in history began with people who refused to accept ruin as final.' },
  { title: 'Brainy and by heart', text: 'Intelligence without conscience is how the world got here. We hire, build and sell with both.' },
  { title: 'AI beside humanity', text: 'The most capable intelligence ever built should work with people, under human judgement.' },
  { title: 'Profit funds purpose', text: 'We must be profitable to last, but profit is the fuel, not the destination.' },
  { title: 'Proof over promises', text: 'We claim only what we can show. Every product carries an honest maturity label.' },
  { title: 'Sovereign by design', text: 'Built in India, deployable anywhere, owned and controlled by the people who use it.' },
];

export const commitments = [
  { title: 'Protect the systems societies run on', text: 'Banks, power, water, telecom and healthcare must keep working through the quantum transition.' },
  { title: 'Help every system see its own footprint', text: 'You cannot reduce what you cannot see. Observability is where efficiency starts.' },
  { title: 'Cut waste in the physical economy', text: 'Every asset reused is one not manufactured.' },
  { title: 'Keep AI beside humanity', text: 'A human in the loop for every decision that matters, and people trained into frontier roles.' },
  { title: 'Be the proof, inside UElement', text: 'A company that preaches repair must practise it, and report on it honestly every year.' },
];

export const decisionFilter = [
  { title: 'Better off?', text: 'Does it leave people or the planet better off, in a way we can measure?' },
  { title: 'Honest?', text: 'Can we describe it publicly without exaggeration?' },
  { title: 'Human in control?', text: 'Do people keep the final say on decisions that matter?' },
  { title: 'Rebuild, not extract?', text: 'Does it repair, protect or make something last, rather than use it up?' },
  { title: 'Pays its way?', text: 'Will it fund the company, so the purpose can last?' },
];

export const partners = [
  { name: 'Perforce', area: 'Data protection and test data management', text: 'Sensitive data stays protected across development and test environments, so a migration or rollout never leaks production records.' },
  { name: 'miniOrange', area: 'DPDP compliance and identity', text: 'Identity, access and consent controls that help you meet India’s Digital Personal Data Protection Act.' },
  { name: 'Marma Security', area: 'Cybersecurity channel alliance', text: 'Takes our quantum-safe and observability offerings to more enterprises, with joint delivery and local support.' },
];

export const faqs = [
  { q: 'What does UElement do?', a: 'We build and deliver quantum-safe security, an enterprise data platform and edge AI research, and we provide the services around them. Our ready products today are U92-PQc, Vizor and Nexus.' },
  { q: 'What is post-quantum cryptography?', a: 'Encryption designed to resist attacks from quantum computers. NIST published the first standards in August 2024 as FIPS 203, 204 and 205.' },
  { q: 'Why act now if quantum computers are years away?', a: 'Data stolen today can be stored and decrypted later. Gartner expects today’s asymmetric cryptography to be unsafe by 2029, and India’s roadmap asks critical infrastructure to be fully quantum-safe by December 2029.' },
  { q: 'Where is UElement based?', a: 'Wakad, Pune, India. We work with customers globally.' },
  { q: 'Can your products run without the cloud?', a: 'Yes. Our enterprise products can run air-gapped, on-premises, in a sovereign cloud or as managed SaaS.' },
  { q: 'How do engagements start?', a: 'With a fixed-scope first step: a quantum readiness scan, a 45-day Vizor proof of value or a Nexus package plan.' },
  { q: 'What do the maturity labels mean?', a: 'Live and Available products are in customer use. Pilot means paid pilots are under way. In build, Planned, Designed and Research mean exactly that.' },
  { q: 'How can I partner with UElement?', a: 'We work with value added resellers, technology alliances and go-to-market partners. See the Partnerships pages.' },
];

export const timeline = [
  { year: '2014', text: 'Our founder starts Viragh Microsystems; its products are later acquired by Promark Softwares.' },
  { year: '2019', text: 'TES Labs, a profitable 3D-printing startup, is acquired by Signet Solutions.' },
  { year: '2026', text: 'UElement Technologies is incorporated in Pune and wins its first paying customer.' },
  { year: 'Today', text: 'Three platforms, four founders and a growing team in Wakad, Pune.' },
];

export function allProducts() {
  return platforms.flatMap((p) => p.products.map((x) => ({ ...x, platform: p })));
}
export function findProduct(slug: string) {
  return allProducts().find((p) => p.slug === slug);
}
export function findIndustry(slug: string) {
  return industries.find((i) => i.slug === slug);
}

// ---------- Why UElement ----------
export const whyPillars = [
  { title: 'You stay in control', text: 'Built in India and deployable anywhere, from an air-gapped room to the cloud. Your data and your keys stay yours.' },
  { title: 'You start small', text: 'A fixed-scope first step, such as a readiness scan or a 45-day proof of value, before any larger commitment.' },
  { title: 'You get the truth', text: 'Every product carries an honest maturity label, and every claim we make can be checked.' },
];

export const advantages = [
  { title: 'Sovereign by design', text: 'Built in India and deployable anywhere: air-gapped, on-premises, sovereign cloud or SaaS. Your data and your keys never have to leave your control.' },
  { title: 'Quantum-ready from day one', text: 'Post-quantum cryptography is designed in, not bolted on. We pair PQC software now with QKD through partners later, the same dual track India’s national roadmap chose.' },
  { title: 'One data plane', text: 'Our enterprise products share one identity, one data layer and one audit trail. Add the next one without re-platforming.' },
  { title: 'Proof before promises', text: 'Start with a fixed-scope step: a quantum readiness scan, a 45-day proof of value or a Nexus package. Decide on more once you have seen results.' },
  { title: 'Founders who have shipped', text: 'Two decades across VMware, BMC, Ericsson and enterprise infrastructure, two earlier startups, and deep roots in banking and telecom.' },
  { title: 'Humans stay in charge', text: 'Every AI feature we ship explains its outputs and keeps a person in the loop for decisions that matter.' },
];

export const usualVsUs = [
  ['Separate tools for monitoring, security and compliance', 'One fabric with one data lake and one audit trail'],
  ['Quantum safety treated as a future upgrade', 'Post-quantum ready now, starting with an inventory of your keys'],
  ['Long discovery projects before any value', 'Fixed-scope first steps with results in weeks'],
  ['Vendor-hosted only, data leaves your estate', 'Your choice of deployment, from air-gapped to SaaS'],
  ['Roadmap features sold as if they were live', 'An honest maturity label on every product'],
];

export type Story = {
  client: string;
  tag: string;
  relation: string;
  challenge: string;
  did: string;
  result: string;
  quote: string;
  inProgress?: boolean;
};

// Results and quotes stay as placeholders until each client approves the wording.
export const stories: Story[] = [
  {
    client: 'TSecond',
    tag: 'Nexus, technology',
    relation: 'Our first customer',
    challenge: 'A web presence serving more than one region, with product catalogues, downloads and hiring to manage in one place.',
    did: 'Built it on Nexus: region-aware catalogue, secure downloads and an integrated careers and applicant-tracking portal.',
    result: '[RESULT CONFIRMED WITH CLIENT]',
    quote: '“[CLIENT QUOTE]” [NAME, ROLE]',
  },
  {
    client: 'Marma Security',
    tag: 'Nexus, cybersecurity',
    relation: 'Customer and channel partner',
    challenge: 'Selling an AI cybersecurity platform to buyers in many countries, each with its own currency and checkout needs.',
    did: 'Built a unified web platform on Nexus with global payments and pricing by geography.',
    result: '[RESULT CONFIRMED WITH CLIENT]',
    quote: '“[CLIENT QUOTE]” [NAME, ROLE]',
  },
  {
    client: 'Quantum-readiness bills of materials for an insurer',
    tag: 'Vizor xBOM, insurance',
    relation: 'In progress',
    challenge: 'Software, crypto and quantum bills of materials for a customer-facing application.',
    did: 'We will publish this story once the work is delivered and the client approves it.',
    result: '',
    quote: '',
    inProgress: true,
  },
];

export const research = [
  {
    title: 'Standards and policy',
    text: 'Input to national and industry quantum-safe frameworks.',
    items: [{ title: '[CONTRIBUTION TITLE]', meta: '[Body or working group]', date: '[MONTH YEAR]' }],
  },
  {
    title: 'Talks and media',
    text: 'Explaining the quantum threat in plain language.',
    items: [
      { title: 'All India Radio: [TOPIC]', meta: 'Chaitanya Ghate', date: '[MONTH YEAR]' },
      { title: '[TALK OR PANEL TITLE]', meta: '[Event], [Speaker]', date: '[MONTH YEAR]' },
    ],
  },
  {
    title: 'Writing',
    text: 'Articles and whitepapers from our team.',
    items: [{ title: '[ARTICLE TITLE]', meta: '[Author], [Publication]', date: '[MONTH YEAR]' }],
  },
  {
    title: 'Academic collaboration',
    text: 'Working with India’s research institutions.',
    items: [{ title: 'Quantum key distribution', meta: 'Research ties with IISc Bengaluru and the Raman Research Institute.', date: '' }],
  },
  {
    title: 'Open source',
    text: 'Code and tools others can use.',
    items: [{ title: '[PROJECT NAME]', meta: '[One-line description], [Repository link]', date: '[MONTH YEAR]' }],
  },
];

export const csr = [
  { kind: 'Digital literacy', title: 'Understanding the algorithms', text: 'A school curriculum that helps students spot misinformation and understand the algorithms that shape what they see online.', measure: 'Schools reached: [NUMBER], students: [NUMBER]' },
  { kind: 'Skilling', title: 'Training the next frontier engineers', text: 'Interns and early-career engineers learn post-quantum cryptography, AI and security on real work. One of our co-founders joined us as an intern.', measure: 'People trained this year: [NUMBER]' },
  { kind: 'Our footprint', title: 'Measuring ourselves first', text: 'We track our own cloud, travel and office footprint, and choose lower-carbon options when costs are close.', measure: 'Baseline published: [YEAR]' },
];

export const recognition = {
  awards: [
    { title: '[AWARD NAME]', meta: '[Awarding body], [Year]' },
    { title: '[AWARD NAME]', meta: '[Awarding body], [Year]' },
  ],
  programmes: [{ title: '[PROGRAMME OR MEMBERSHIP]', meta: '[Organisation], [Year]' }],
  media: [{ title: '[HEADLINE]', meta: '[Publication]', date: '[MONTH YEAR]' }],
};

// ---------- Partner programmes ----------
// Programme terms below describe intent; confirm commercial details before launch.
export const programmes = [
  {
    slug: 'value-added-reseller',
    name: 'Value Added Reseller',
    nav: 'Become a Value Added Reseller',
    summary: 'Resell and deliver UElement products to your customers, with our engineers beside you on early deals.',
    forWho: 'Systems integrators, resellers and managed service providers serving banks, government and enterprise.',
    offer: [
      'Training on our products for your sales and technical teams',
      'Demo environments and sales material',
      'Deal registration, so the opportunities you find stay yours',
      'Joint delivery with our engineers on your first deals',
    ],
    ask: ['Customers in BFSI, government, manufacturing or data centres', 'A technical team that can deliver and support', 'A shared plan for the first two quarters'],
  },
  {
    slug: 'technology-alliance',
    name: 'Technology Alliance',
    nav: 'Form a Technology Alliance',
    summary: 'Build integrations with our platforms, or co-develop U92 Deeptech products as a design partner.',
    forWho: 'Hardware makers, software vendors, cloud providers and research institutions.',
    offer: [
      'Integration support from our engineering team',
      'Joint solution briefs when the integration is proven',
      'Design partnerships for KalaMOS, BoSC3, NobisGRID and MagCHAIN',
      'Early access to new products and roadmaps',
    ],
    ask: ['A technology that strengthens quantum-safe, observability or edge use cases', 'An engineering contact who can own the integration', 'Willingness to publish only what has been proven'],
  },
  {
    slug: 'gtm-partnership',
    name: 'GTM Partnership',
    nav: 'Explore GTM Partnership',
    summary: 'Take UElement to new regions and industries together, through co-selling and joint launches.',
    forWho: 'Consultancies, regional channel partners, industry bodies and alliances with reach we do not have.',
    offer: [
      'Co-selling with shared account plans',
      'Joint launches in new regions and industries',
      'Referral arrangements for introductions',
      'Speakers and content for your events and members',
    ],
    ask: ['Relationships with buyers in a region or industry we serve', 'A named lead who owns the partnership', 'Shared goals we can measure each quarter'],
  },
];

// ---------- Resource center ----------
export const resourceSections = [
  {
    slug: 'blogs',
    name: 'Blogs',
    icon: 'book',
    title: 'Writing from the UElement team.',
    lede: 'Plain-language articles on post-quantum cryptography, observability and edge AI.',
    empty: 'Our first articles are being written. Until they are published, the FAQs answer the questions we hear most.',
    action: { label: 'Read the FAQs', href: '/company/faqs/' },
  },
  {
    slug: 'webinars',
    name: 'Webinars',
    icon: 'play',
    title: 'Sessions you can join or watch later.',
    lede: 'Live and recorded sessions on quantum readiness, compliance and building on our platforms.',
    empty: 'No webinars are scheduled yet. Tell us a topic you would like covered and we will consider it for the first session.',
    action: { label: 'Suggest a topic', href: '/support/suggestion/' },
  },
  {
    slug: 'media-gallery',
    name: 'Media Gallery',
    icon: 'image',
    title: 'Photos, logos and brand assets.',
    lede: 'Images of our team and work, and the brand assets you need to write about us.',
    empty: 'The gallery is being prepared. For logos, founder photos or product images, write to us and we will send them.',
    action: { label: 'Request brand assets', href: '/contact/?topic=Media' },
  },
  {
    slug: 'newsroom',
    name: 'Newsroom',
    icon: 'news',
    title: 'News and company facts.',
    lede: 'Announcements from UElement, and the facts journalists ask for.',
    empty: 'There are no announcements yet. The company facts below are accurate and ready to use.',
    action: { label: 'Contact us for press', href: '/contact/?topic=Media' },
  },
  {
    slug: 'events',
    name: 'Events',
    icon: 'calendar',
    title: 'Where to meet us.',
    lede: 'Conferences, talks and workshops where the UElement team is speaking or attending.',
    empty: 'No events are listed right now. If you would like a UElement speaker at your event, write to us.',
    action: { label: 'Invite a speaker', href: '/contact/' },
  },
] as const;

// ---------- Support ----------
export const supportTopics = [
  { slug: 'knowledge-base', name: 'Knowledge Base', icon: 'book', kind: 'info', title: 'Answers to common questions.', lede: 'Articles on setting up, running and troubleshooting UElement products.' },
  { slug: 'user-guides', name: 'User Guides', icon: 'book', kind: 'info', title: 'Guides for every product you run.', lede: 'Installation, administration and user guides for each UElement product.' },
  { slug: 'customer-portal', name: 'Customer Portal', icon: 'key', kind: 'portal', title: 'Your tickets, guides and releases in one place.', lede: 'Customers use the portal to raise and track tickets, download releases and read product guides.' },
  { slug: 'service-quote', name: 'Get Service Quote', icon: 'handshake', kind: 'quote', title: 'Get a quote for a service.', lede: 'Tell us the service, the scope and when you want to start. We reply with a scoped first step and a quote.' },
  { slug: 'get-support', name: 'Get Support Now', icon: 'lifebuoy', kind: 'support', title: 'Get help with a UElement product.', lede: 'Tell us what happened and how serious it is. The more detail you give, the faster we can help.' },
  { slug: 'demo', name: 'Get Demo', icon: 'play', kind: 'demo', title: 'See a product working on a problem like yours.', lede: 'Choose a product and tell us about your environment. We will show you what it does, live, and answer your questions.' },
  { slug: 'suggestion', name: 'Submit Suggestion', icon: 'bulb', kind: 'suggestion', title: 'Tell us how we could do better.', lede: 'Ideas for our products, our services or this website.' },
] as const;
