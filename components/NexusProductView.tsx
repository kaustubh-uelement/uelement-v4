'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { HeroRing, HeroSparks } from '@/components/HeroRing';
import './nexus/nexus.css';

/* ==========================================================================
   DATA DEFINITIONS (Matching exact design specifications)
   ========================================================================== */

interface ModuleItem {
  n: string;
  name: string;
  tier: 'BASIC' | 'ADVANCE' | 'PREMIUM';
  blurb: string;
  subs: string[];
  cat: string;
}

interface CategoryItem {
  key: string;
  name: string;
  range: string;
  desc: string;
  mods: ModuleItem[];
}

const CATS: CategoryItem[] = [
  {
    key: 'dx',
    name: 'Digital Experience',
    range: '01–06',
    desc: 'The sites, apps and content a customer sees first.',
    mods: [
      {
        n: '01',
        name: 'Website CMS',
        tier: 'BASIC',
        blurb: 'Build and run every site from one workspace, in every language you serve.',
        subs: ['Visual Page Builder', 'Multi-site and Multilingual', 'Content Workflow', 'Content Types', 'Publishing', 'NexusIQ Assist'],
        cat: 'dx',
      },
      {
        n: '02',
        name: 'SEO & Analytics',
        tier: 'ADVANCE',
        blurb: 'Rankings, paid search, privacy-first analytics and Core Web Vitals in one view.',
        subs: ['On-page SEO', 'Rankings', 'Paid Search', 'Web Analytics', 'Performance', 'Reporting'],
        cat: 'dx',
      },
      {
        n: '03',
        name: 'GenAI Site Assistant',
        tier: 'PREMIUM',
        blurb: 'Plain-language search and cited answers on your site, portal and app.',
        subs: ['Voice Assistant', 'Semantic Search', 'Answer Engine', 'Indexing', 'Content Gaps', 'Guardrails', 'Placement'],
        cat: 'dx',
      },
      {
        n: '04',
        name: 'Mobile App',
        tier: 'PREMIUM',
        blurb: 'iOS and Android apps built from the same content, branded as yours.',
        subs: ['App Shell', 'Customer Features', 'Content Sync', 'Engagement', 'Releases'],
        cat: 'dx',
      },
      {
        n: '05',
        name: 'Forms & Enquiries',
        tier: 'BASIC',
        blurb: 'Every enquiry from every channel in one inbox, routed with SLAs.',
        subs: ['Form Builder', 'One Inbox', 'Routing', 'Inbox Workspace', 'Conversion', 'Integrations'],
        cat: 'dx',
      },
      {
        n: '06',
        name: 'Blog & Newsletter Studio',
        tier: 'ADVANCE',
        blurb: 'Blogs and newsletters with editorial workflow, double opt-in and digests.',
        subs: [
          'Blog Setup', 'Author Workflows', 'Post Editor', 'Comments & Moderation',
          'Distribution', 'Blog Analytics', 'Publications', 'Subscriber Management',
          'Digest Automation', 'Members-only Content', 'Delivery', 'Newsletter Analytics', 'NexusIQ'
        ],
        cat: 'dx',
      },
    ],
  },
  {
    key: 'bm',
    name: 'Brand & Marketing',
    range: '07–11',
    desc: 'Brand control, assets, social, campaigns and listening.',
    mods: [
      {
        n: '07',
        name: 'Brand Identity Kit',
        tier: 'BASIC',
        blurb: 'Logos, templates and rules shared with agencies, with brand checks built in.',
        subs: ['Brand Assets', 'Template Library', 'Governance', 'Brand Portal'],
        cat: 'bm',
      },
      {
        n: '08',
        name: 'Digital Asset Library',
        tier: 'BASIC',
        blurb: 'One library for every asset, with rights, expiry and where-used tracking.',
        subs: ['Organisation', 'Rights Management', 'Where-used Tracking', 'Renditions', 'Access'],
        cat: 'bm',
      },
      {
        n: '09',
        name: 'Social Media Manager',
        tier: 'ADVANCE',
        blurb: 'Publishing calendar plus agency and influencer management with post-level results.',
        subs: ['Social Publishing', 'Agency Management', 'Influencer Management', 'Campaign Management', 'Social Analytics', 'Social Inbox'],
        cat: 'bm',
      },
      {
        n: '10',
        name: 'Campaigns & Messaging',
        tier: 'ADVANCE',
        blurb: 'Email, WhatsApp and SMS journeys built on consented, segmented audiences.',
        subs: ['Audiences', 'Email', 'WhatsApp and SMS', 'Journeys', 'Reporting'],
        cat: 'bm',
      },
      {
        n: '11',
        name: 'Brand Social Analytics',
        tier: 'PREMIUM',
        blurb: 'Listening, sentiment (incl. Hindi, Marathi, Hinglish), trends and crisis alerts.',
        subs: [
          'Listening Sources', 'Query Builder', 'Sentiment Analysis', 'Trend Analysis',
          'Spike and Crisis Alerts', 'Audience Insights', 'Influencer Discovery',
          'Reviews and Ratings', 'Post and Campaign Analytics', 'NexusIQ Insights', 'Reports and Dashboards'
        ],
        cat: 'bm',
      },
    ],
  },
  {
    key: 'cs',
    name: 'Customer Services',
    range: '12–16',
    desc: 'Identity, the customer record, self-service, events and experience.',
    mods: [
      {
        n: '12',
        name: 'Customer Identity (CIAM)',
        tier: 'BASIC',
        blurb: 'OTP, passkeys, SSO and DPDP-ready consent for every customer sign-in.',
        subs: ['Sign-in', 'Security', 'Single Sign-on', 'Consent', 'Self-service'],
        cat: 'cs',
      },
      {
        n: '13',
        name: 'Party Graph',
        tier: 'BASIC',
        blurb: 'One profile per person and company, with every touchpoint on one timeline.',
        subs: ['Unified Profile', 'Relationships', 'Timeline', 'Segments & Scores', 'Access & Masking'],
        cat: 'cs',
      },
      {
        n: '14',
        name: 'Customer & Member Portal',
        tier: 'ADVANCE',
        blurb: 'Accounts, documents, payments, KYC and service in one member portal.',
        subs: ['Dashboard', 'Documents', 'Payments', 'Service', 'KYC and Profile', 'Alerts'],
        cat: 'cs',
      },
      {
        n: '15',
        name: 'Event Management',
        tier: 'PREMIUM',
        blurb: 'In-person, online and hybrid events, from paid registration to certificates.',
        subs: ['Event Setup', 'Registration', 'Payments', 'Check-in', 'Follow-up'],
        cat: 'cs',
      },
      {
        n: '16',
        name: 'Customer Experience',
        tier: 'PREMIUM',
        blurb: 'Journeys, NPS, concierge, festive greetings, gifting and service recovery.',
        subs: [
          'Experience Management', 'Experience Improvement', 'Concierge Services',
          'Birthdays, Anniversaries & Milestones', 'Festive Season Programmes', 'Gifting',
          'Loyalty & Recognition', 'Service Recovery', 'VIP Programmes', 'NexusIQ',
          'CX Analytics', 'Consent & Preferences'
        ],
        cat: 'cs',
      },
    ],
  },
  {
    key: 'bp',
    name: 'Business Portals',
    range: '17–24',
    desc: 'Portals for candidates, partners, learners, vendors, dealers and employees.',
    mods: [
      {
        n: '17',
        name: 'Careers & ATS',
        tier: 'BASIC',
        blurb: 'Careers site, pipeline, assessments and offers through to onboarding.',
        subs: ['Careers Site', 'Applications', 'Pipeline', 'Interview & Meeting Portal', 'Offers and Onboarding', 'Sourcing', 'Analytics'],
        cat: 'bp',
      },
      {
        n: '18',
        name: 'Partner Network Portal',
        tier: 'ADVANCE',
        blurb: 'Partner onboarding, tiers, deal registration and commission statements.',
        subs: ['Onboarding', 'Tiers', 'Deal Registration', 'Collateral', 'Commission', 'Performance'],
        cat: 'bp',
      },
      {
        n: '19',
        name: 'Training & Certification',
        tier: 'PREMIUM',
        blurb: 'Courses, learning paths, proctored assessments and verifiable certificates.',
        subs: ['Course Builder', 'Learning Paths', 'Assessments', 'Certificates', 'Compliance Training'],
        cat: 'bp',
      },
      {
        n: '20',
        name: 'Product Portfolio',
        tier: 'BASIC',
        blurb: 'Publish a product once and it updates the site, app, portals and AI assistant.',
        subs: ['Catalogue', 'Datasheets', 'Tools', 'Publish Once', 'Lifecycle'],
        cat: 'bp',
      },
      {
        n: '21',
        name: 'Document & Contract Management (HR, Finance, Sales)',
        tier: 'PREMIUM',
        blurb: 'Contracts and documents with Aadhaar eSign, DSC, e-stamping and AI clause review.',
        subs: [
          'Document Store', 'Templates and Generation', 'Contract Lifecycle', 'E-signature and Stamping',
          'Key Dates and Obligations', 'HR Documents', 'Finance Documents', 'Sales Documents',
          'Contract Intelligence (NexusIQ)', 'Security and Compliance', 'Reporting', 'Integrations', 'Decentralisation'
        ],
        cat: 'bp',
      },
      {
        n: '22',
        name: 'Vendor & Procurement Portal',
        tier: 'ADVANCE',
        blurb: 'Vendor onboarding, RFQs, purchase orders and 3-way-matched invoices.',
        subs: ['Vendor Onboarding', 'RFQ & Bidding', 'PO Lifecycle', 'Vendor Scorecards', 'Vendor Compliance', 'Invoices & Payments', 'Contracts & KYC'],
        cat: 'bp',
      },
      {
        n: '23',
        name: 'Dealer/Distributor Portal',
        tier: 'ADVANCE',
        blurb: 'Dealer stock, orders, claims, schemes and credit in one portal.',
        subs: ['Inventory Visibility', 'Order Placement', 'Claims & Returns', 'Territory Management', 'Schemes & Incentives', 'Credit & Payments', 'Dealer Onboarding'],
        cat: 'bp',
      },
      {
        n: '24',
        name: 'Employee Self-Service / Intranet',
        tier: 'BASIC',
        blurb: 'Directory, leave, payslips, announcements and HR/IT help for every employee.',
        subs: ['Employee Directory', 'Leave & Attendance', 'Payroll Self-Service', 'Internal Announcements', 'Asset Requisition', 'HR & IT Helpdesk', 'Pulse Surveys', 'Documents'],
        cat: 'bp',
      },
    ],
  },
  {
    key: 'ai',
    name: 'Service & AI',
    range: '25–33',
    desc: 'Support, AI, automation, customer success and service operations.',
    mods: [
      {
        n: '25',
        name: 'Support & Services Portal',
        tier: 'BASIC',
        blurb: 'Tickets from web, email, WhatsApp and phone, with SLAs and a help centre.',
        subs: ['Ticketing', 'SLAs', 'Help Centre', 'Agent Workspace', 'Feedback'],
        cat: 'ai',
      },
      {
        n: '26',
        name: 'AI Assistant',
        tier: 'ADVANCE',
        blurb: 'A grounded assistant that answers from approved content and takes actions.',
        subs: ['Channels', 'Grounded Answers', 'Actions', 'Hand-off', 'Guardrails', 'Model'],
        cat: 'ai',
      },
      {
        n: '27',
        name: 'Workflow Designer',
        tier: 'PREMIUM',
        blurb: 'Visual workflows with approvals, maker-checker and connectors.',
        subs: ['Visual Builder', 'Triggers', 'Approvals', 'Connectors', 'Lifecycle'],
        cat: 'ai',
      },
      {
        n: '28',
        name: 'Agentic Automation',
        tier: 'PREMIUM',
        blurb: 'Ready-made and custom AI agents that work behind a human approval queue.',
        subs: ['Ready-made NexusIQ Agents', 'Custom Agents', 'Guardrails', 'Approval Queue', 'Monitoring'],
        cat: 'ai',
      },
      {
        n: '29',
        name: 'Customer Success',
        tier: 'ADVANCE',
        blurb: 'Account health, onboarding plans, adoption and renewals for every customer.',
        subs: ['Account Health', 'Onboarding and Success Plans', 'Adoption Analytics', 'Renewals and Expansion', 'Success Manager Workspace', 'Voice of the Customer'],
        cat: 'ai',
      },
      {
        n: '30',
        name: 'Change Management',
        tier: 'ADVANCE',
        blurb: 'Change requests, approvals, freeze windows and audit evidence.',
        subs: ['Change Requests', 'Approvals and Calendar', 'Releases', 'People Change and Adoption', 'Audit Evidence'],
        cat: 'ai',
      },
      {
        n: '31',
        name: 'Service Operations Observability',
        tier: 'PREMIUM',
        blurb: 'Live service operations, incidents, problems and workforce planning.',
        subs: ['Live Operations Dashboard', 'Channel and Journey Health', 'Service Map', 'Incidents and Problems', 'Workforce Management', 'Alerts', 'Vizor Link'],
        cat: 'ai',
      },
      {
        n: '32',
        name: 'Service Catalogue & Request Fulfilment',
        tier: 'ADVANCE',
        blurb: 'A catalogue of requestable services with automatic fulfilment.',
        subs: ['Service Catalogue', 'Request Fulfilment Automation', 'Change Linkage', 'Self-service Tracking', 'Fulfilment Reporting'],
        cat: 'ai',
      },
      {
        n: '33',
        name: 'AI Quality, Risk & Model Governance',
        tier: 'PREMIUM',
        blurb: 'QA, drift detection, explainability and model documentation for NexusIQ.',
        subs: ['Conversation QA & Audit', 'Bias & Drift Detection', 'Model Performance Monitoring', 'AI Decision Explainability Log', 'Human Override Analytics', 'Guardrail Effectiveness Reporting', 'Regulatory Model Documentation'],
        cat: 'ai',
      },
    ],
  },
  {
    key: 'rg',
    name: 'Run & Govern',
    range: '34–37',
    desc: 'Administration, reporting, hosting and data governance.',
    mods: [
      {
        n: '34',
        name: 'Admin Console',
        tier: 'BASIC',
        blurb: 'Modules, users, roles, audit log, branding and billing in one console.',
        subs: ['Module Manager', 'Users and Roles', 'Audit Log', 'Workspace Settings', 'Billing'],
        cat: 'rg',
      },
      {
        n: '35',
        name: 'Reports & Dashboards',
        tier: 'ADVANCE',
        blurb: 'Dashboards, funnels and scheduled reports across every module.',
        subs: ['Dashboard Builder', 'Funnels', 'Scheduled Reports', 'Data Access', 'Alerts'],
        cat: 'rg',
      },
      {
        n: '36',
        name: 'Hosting, Security & Compliance',
        tier: 'ADVANCE',
        blurb: 'India-region hosting, security, DPDP requests and compliance reporting support.',
        subs: ['Hosting', 'Security', 'Compliance', 'Monitoring'],
        cat: 'rg',
      },
      {
        n: '37',
        name: 'Data Governance & Master Data Management',
        tier: 'ADVANCE',
        blurb: 'Data dictionary, quality rules, master data and lineage across modules.',
        subs: ['Data Dictionary', 'Data Quality Rules', 'Master Data Sync', 'Data Lineage Tracking', 'Retention Rules'],
        cat: 'rg',
      },
    ],
  },
  {
    key: 'ad',
    name: 'Industry add-ons',
    range: 'A1–A3',
    desc: 'Sold separately to the businesses they fit.',
    mods: [
      {
        n: 'A1',
        name: 'Franchise Management Portal',
        tier: 'PREMIUM',
        blurb: 'Franchise onboarding, royalties, outlet audits and local marketing.',
        subs: ['Franchise Onboarding', 'Royalty & Fee Management', 'Operations Compliance', 'Franchise Performance Dashboard', 'Supply Ordering', 'Local Marketing Kit', 'Training'],
        cat: 'ad',
      },
      {
        n: 'A2',
        name: 'Investor & Stakeholder Relations Portal',
        tier: 'PREMIUM',
        blurb: 'Document room, disclosures, shareholder register and e-voting.',
        subs: ['Document Room', 'Reporting Calendar', 'Q&A and Updates Channel', 'Shareholder Register', 'Meetings & E-voting', 'Access Controls'],
        cat: 'ad',
      },
      {
        n: 'A3',
        name: 'BFSI Fraud & Risk Signal Detection',
        tier: 'PREMIUM',
        blurb: 'Real-time anomaly flags, identity risk scoring and investigation cases.',
        subs: ['Anomaly Detection', 'Identity Risk Scoring', 'Case Management for Investigations'],
        cat: 'ad',
      },
    ],
  },
];

const ALL_MODS: Record<string, ModuleItem> = {};
CATS.forEach((c) => c.mods.forEach((m) => { ALL_MODS[m.n] = m; }));

interface PackageItem {
  name: string;
  mods: number;
  first: number;
  renew: number;
  desc: string;
}

interface BestResult {
  p: PackageItem;
  extra: number;
  cost: number;
}

const PKGS: PackageItem[] = [
  { name: 'Starter', mods: 3, first: 2500, renew: 1250, desc: 'A first surface done properly: for example a website, its enquiry inbox and sign-in.' },
  { name: 'Advance', mods: 6, first: 5000, renew: 2500, desc: 'A connected front door: site, search, inbox, identity and the customer record.' },
  { name: 'Enterprise', mods: 12, first: 10000, renew: 3750, desc: 'Customer, partner and employee portals with support and AI on one platform.' },
  { name: 'Large Enterprise', mods: 24, first: 25000, renew: 5000, desc: 'Most of the fabric switched on across business units and brands.' },
];

const EXTRA_MOD_COST = 1000;
const SHOW_PRICES = true;

const PRESETS = [
  { name: 'Website starter', desc: 'Website CMS, Forms & Enquiries, Customer Identity', picks: ['01', '05', '12'] },
  { name: 'Digital front door', desc: 'Website, SEO, GenAI search, enquiries, identity, Party Graph', picks: ['01', '02', '03', '05', '12', '13'] },
  { name: 'Customer service hub', desc: 'Identity, Party Graph, member portal, support desk, AI assistant, CX', picks: ['12', '13', '14', '16', '25', '26'] },
  { name: 'People and partners', desc: 'Careers, partner portal, training, documents, employee self-service', picks: ['17', '18', '19', '21', '24'] },
];

const FLOWS = [
  { a: '17 Careers', what: 'A candidate accepts an offer', b: '21 Documents', result: 'the offer letter goes out for e-signature' },
  { a: '17 Careers', what: 'A new hire joins', b: '24 Employee Self-Service', result: 'they appear in the employee directory' },
  { a: '05 Enquiries', what: 'An enquiry arrives on any channel', b: '13 Party Graph', result: 'it lands on one profile with the full timeline' },
  { a: '28 Agents', what: 'An agent drafts a missing FAQ', b: '25 Help Centre', result: 'once approved, it is published as an article' },
  { a: '22 Vendors', what: 'A bid is awarded', b: '22 Purchase orders', result: 'the purchase order is issued to the vendor' },
  { a: '32 Requests', what: 'A request needs a change', b: '30 Change Management', result: 'a change request opens automatically' },
  { a: '36 Compliance', what: 'A DPDP erasure is approved', b: 'Every module', result: 'the person is anonymised everywhere, with lawful retention kept' },
];

const TRUST = [
  { title: 'DPDP-ready consent', body: 'Consent by purpose, a preference centre and an audit trail at sign-in, with access, correction and erasure requests handled across modules.' },
  { title: 'India-region hosting', body: 'Sovereign cloud in India regions with CDN, autoscaling, backups and disaster recovery. Deployable elsewhere when you need it.' },
  { title: 'Indian languages', body: 'English, Hindi, Marathi and more on every customer-facing screen; sentiment that reads Hindi, Marathi and mixed Hindi-English.' },
  { title: 'Payments the way India pays', body: 'UPI, cards and net banking for EMIs, bills and paid events, with GST invoices.' },
  { title: 'Paperwork that signs itself', body: 'Aadhaar eSign, digital signature certificates and e-stamping, with signing order and audit certificates.' },
  { title: 'WhatsApp first', body: 'Approved-template broadcasts and two-way replies, DLT-registered SMS, and WhatsApp as a channel for enquiries and support.' },
  { title: 'Regulator-ready records', body: 'Audit logs in every module, support for CERT-In incident reporting and mapping to RBI and SEBI guidelines.' },
  { title: 'No lock-in', body: 'Full data export and documented APIs for every module, white-labelled to your brand on every device.' },
];

const ROLES = [
  {
    key: 'mkt',
    name: 'Marketing and brand',
    head: 'Launch campaigns without waiting on IT.',
    body: 'Pages, posts, newsletters, social and listening in one place, with your brand locked in and every agency held to it.',
    mods: ['01 Website CMS', '06 Blog & Newsletter', '07 Brand Kit', '09 Social', '10 Campaigns', '11 Listening'],
    wins: [
      'Draft pages and posts from a brief with NexusIQ, in Indian languages',
      'Manage agencies and influencers with post-level results',
      'Catch a sentiment drop or mention spike before it becomes a crisis',
      'Send email, WhatsApp and SMS only to people who consented',
    ],
  },
  {
    key: 'cx',
    name: 'Customer service and CX',
    head: 'Every customer, every channel, one record.',
    body: 'Tickets, chat, the member portal and experience programmes work from the same Party Graph, so nobody asks the customer twice.',
    mods: ['12 Identity', '13 Party Graph', '14 Member Portal', '16 Customer Experience', '25 Support', '26 AI Assistant'],
    wins: [
      'Answer routine questions with a grounded, cited assistant',
      'See SLA risk before a breach, not after',
      'Turn a missed SLA into an automatic goodwill gesture',
      'Send birthday, milestone and festive greetings with consent',
    ],
  },
  {
    key: 'hr',
    name: 'HR and people',
    head: 'From first application to everyday self-service.',
    body: 'A careers site and applicant tracking before hire, and an employee portal after it, sharing one directory and one document store.',
    mods: ['17 Careers & ATS', '19 Training', '21 Documents', '24 Employee Self-Service'],
    wins: [
      'Run assessments, interviews and offers in one pipeline',
      'Send offer letters for e-signature in one step',
      'Give staff payslips, leave and HR help in one portal',
      'Track mandatory training such as KYC and AML',
    ],
  },
  {
    key: 'sales',
    name: 'Sales, partners and dealers',
    head: 'Portals your channel will actually use.',
    body: 'Deal registration and commissions for partners, stock and orders for dealers, and one product catalogue feeding them all.',
    mods: ['18 Partner Portal', '20 Product Portfolio', '21 Documents', '22 Vendors', '23 Dealers'],
    wins: [
      'Publish a product once and update every portal and the AI assistant',
      'Check deal conflicts at registration',
      'Show dealers stock, schemes, credit and claims',
      'Share proposals in a tracked deal room',
    ],
  },
  {
    key: 'it',
    name: 'IT, risk and compliance',
    head: 'One platform to secure, govern and audit.',
    body: 'Roles, SSO, audit logs, data governance and AI governance in one console, instead of a dozen vendor reviews.',
    mods: ['33 AI Governance', '34 Admin Console', '36 Hosting & Compliance', '37 Data Governance'],
    wins: [
      'Handle DPDP requests once, across every module',
      'Test in a sandbox and roll back configuration in one click',
      'Explain any AI decision from its log',
      'Keep one data dictionary, lineage and master record',
    ],
  },
  {
    key: 'lead',
    name: 'Leadership',
    head: 'Fewer vendors. One view of the front door.',
    body: 'One subscription replaces a stack of tools, and one set of dashboards shows the whole funnel from visitor to customer.',
    mods: ['29 Customer Success', '35 Reports & Dashboards', '31 Service Operations'],
    wins: [
      'See funnels and attribution across every module',
      'Know which accounts are healthy and which may leave',
      'Grow by switching on modules, not buying new tools',
      'Keep data in India regions by default',
    ],
  },
];

const COMPARE = [
  { k: 'Customer record', a: 'A copy in every tool', b: 'Unified, after integration work', n: 'One Party Graph shared by every module' },
  { k: 'Sign-in', a: 'Separate logins per tool', b: 'Single sign-on, configured', n: 'One identity for customers, partners and staff' },
  { k: 'AI', a: 'Different bots, different rules', b: 'Add-on AI products', n: 'NexusIQ in every module, with approvals and audit' },
  { k: 'India readiness', a: 'Varies by vendor', b: 'Often needs local partners', n: 'DPDP, UPI, Aadhaar eSign, WhatsApp, Indian languages' },
  { k: 'How you buy', a: 'Many contracts and renewals', b: 'Large licence, long implementation', n: 'Packages of 3 to 24 modules, add one at a time' },
  { k: 'Getting started', a: 'Quick per tool, slow to connect', b: 'Months of programme work', n: 'A small, fixed-scope first step' },
  { k: 'Leaving', a: 'Export tool by tool', b: 'Depends on the contract', n: 'Full data export and documented APIs' },
];

const FAQS = [
  {
    q: 'Is Nexus a website builder, a portal or a DXP?',
    a: 'All three, on one platform. Nexus covers the website and search, apps and sign-in, customer, partner, employee and vendor portals, and the workflows and AI behind them. You switch on only the modules you need.',
  },
  {
    q: 'Can we start small?',
    a: 'Yes. The Starter package has three modules, and every engagement starts with a small, fixed-scope first step so you can judge the work before committing to more. You add modules one at a time later.',
  },
  {
    q: 'Does Nexus replace our ERP, HRMS or core banking system?',
    a: 'No. Nexus is the outward-facing layer. The vendor, dealer and employee portals connect to your ERP and HRMS rather than replacing them, and the Workflow Designer connects to core banking, loan and CRM systems.',
  },
  {
    q: 'Where is our data hosted?',
    a: 'In India regions by default, with CDN, backups and disaster recovery. Nexus can be deployed elsewhere when your customers or regulators need it.',
  },
  {
    q: 'How does NexusIQ use our data?',
    a: 'NexusIQ answers from your approved content and records, inside the guardrails you set. Agents draft and people approve, every action is logged, and the AI governance module tracks quality, drift and overrides.',
  },
  {
    q: 'Which languages are supported?',
    a: 'English, Hindi, Marathi and other Indian languages on every customer-facing screen, with translation drafts from NexusIQ.',
  },
  {
    q: 'Can we get our data out?',
    a: 'Yes. Every module has documented APIs and full data export. There is no lock-in.',
  },
  {
    q: 'Do you work with partners and resellers?',
    a: 'Yes. Systems integrators and resellers can deliver and resell Nexus. Contact us about the partner programme.',
  },
];

const usd = (n: number) => 'USD ' + n.toLocaleString('en-US');

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export function NexusProductView() {
  const [activeCat, setActiveCat] = useState<string>('dx');
  const [picked, setPicked] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string>('mkt');
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    first: 'Website and enquiries',
  });
  const [formMsg, setFormMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Load saved picked modules from localStorage after mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nexus-lp-picked') || '[]');
      if (Array.isArray(saved)) {
        setPicked(saved.filter((n) => ALL_MODS[n]));
      }
    } catch {
      // ignore
    }
  }, []);

  const savePicked = (items: string[]) => {
    setPicked(items);
    try {
      localStorage.setItem('nexus-lp-picked', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const toggleModule = (n: string) => {
    const next = picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n];
    savePicked(next);
  };

  const applyPreset = (picks: string[]) => {
    savePicked([...picks]);
  };

  const clearPicked = () => {
    savePicked([]);
  };

  // Best package calculation
  const best = useMemo<BestResult | null>(() => {
    const count = picked.length;
    if (!count) return null;
    let b: BestResult | null = null;
    for (const p of PKGS) {
      const extra = Math.max(0, count - p.mods);
      const cost = p.first + extra * EXTRA_MOD_COST;
      if (!b || cost < b.cost || (cost === b.cost && p.mods > b.p.mods)) {
        b = { p, extra, cost };
      }
    }
    return b;
  }, [picked.length]);

  const bestPkgName = best?.p.name;
  const bestHead = best
    ? `${picked.length} ${picked.length === 1 ? 'module' : 'modules'} → ${best.p.name}${best.extra ? ` + ${best.extra} extra` : ''}`
    : 'Pick modules to size your package';
  const bestDetail = best
    ? (SHOW_PRICES ? `Indicative first year: ${usd(best.cost)}, excluding taxes. Your proposal confirms scope and price.` : 'We will confirm scope and price in your proposal.')
    : 'Tap Add on any module above, or start from a common first step on the right.';

  const currentCat = useMemo(() => {
    return CATS.find((c) => c.key === activeCat) || CATS[0];
  }, [activeCat]);

  const currentRole = useMemo(() => {
    return ROLES.find((r) => r.key === activeRole) || ROLES[0];
  }, [activeRole]);

  const pickedNames = useMemo(() => {
    return picked.map((n) => ALL_MODS[n]).filter(Boolean);
  }, [picked]);

  const pickedModulesString = useMemo(() => {
    return pickedNames.length
      ? pickedNames.map((m) => `${m.n} ${m.name}`).join(', ')
      : 'None yet: add modules above';
  }, [pickedNames]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormMsg({ text: 'Please add your name and a valid work email.', isError: true });
      return;
    }

    const body = `Name: ${formData.name}\nWork email: ${formData.email}\nCompany: ${formData.company || ''}\nPhone/WhatsApp: ${formData.phone || ''}\nLaunch first: ${formData.first || ''}\nModules picked: ${pickedModulesString}`;
    window.location.href = `mailto:contact@uelement.co?subject=${encodeURIComponent('Nexus demo request')}&body=${encodeURIComponent(body)}`;
    setFormMsg({
      text: 'Your email app should open with the request filled in. If it does not, write to contact@uelement.co.',
      isError: false,
    });
  };

  const getTierStyle = (t: string) => {
    const base: React.CSSProperties = {
      padding: '3px 10px',
      borderRadius: '999px',
      fontFamily: 'var(--font-reddit), sans-serif',
      fontSize: '11.5px',
      fontWeight: 700,
      letterSpacing: '.08em',
    };
    if (t === 'PREMIUM') {
      return { ...base, background: '#0E1B36', color: '#F1D894' };
    }
    if (t === 'ADVANCE') {
      return { ...base, background: '#E9DEC6', color: '#5A4013' };
    }
    return { ...base, background: '#FFFFFF', color: '#4A5373', border: '1px solid rgba(13,26,52,.18)' };
  };

  return (
    <div className="nexus-page" id="main">
      {/* ============ HERO (space navy with exact landing page chakra) ============ */}
      <header id="top" className="nexus-hero">
        {/* Background Rotating Chakra & Canvas Sparks */}
        <div className="nexus-hero__chakra-wrap" aria-hidden="true">
          <HeroSparks />
          <HeroRing />
        </div>

        {/* Secondary anchor pill navigation */}
        <nav
          aria-label="Nexus Navigation"
          className="nexus-hero__content"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '10px 12px 10px 22px',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
            border: '1px solid rgba(221,187,110,.35)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <Link href="/" aria-label="UElement home" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#F1D894', letterSpacing: '0.02em' }}>
              UElement
            </span>
          </Link>
          <span className="nexus-hide-sm" aria-hidden="true" style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,.18)' }} />
          <span className="nexus-hide-sm" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontWeight: 700, fontSize: '16px', color: '#FFFFFF', letterSpacing: '.01em' }}>
            Nexus
          </span>
          <div className="nexus-navlinks" style={{ display: 'flex', gap: '4px', marginLeft: 'auto', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '15px', fontWeight: 500 }}>
            <a className="nexus-navlink" href="#why" style={{ color: '#D9DEE8', padding: '9px 14px', borderRadius: '999px' }}>Why Nexus</a>
            <a className="nexus-navlink" href="#modules" style={{ color: '#D9DEE8', padding: '9px 14px', borderRadius: '999px' }}>Modules</a>
            <a className="nexus-navlink" href="#ai" style={{ color: '#D9DEE8', padding: '9px 14px', borderRadius: '999px' }}>NexusIQ</a>
            <a className="nexus-navlink" href="#packages" style={{ color: '#D9DEE8', padding: '9px 14px', borderRadius: '999px' }}>Packages</a>
            <a className="nexus-navlink" href="#faq" style={{ color: '#D9DEE8', padding: '9px 14px', borderRadius: '999px' }}>FAQ</a>
          </div>
          <a
            className="btn btn--metal btn--sm nexus-btn"
            href="#demo"
            style={{
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-reddit), sans-serif',
              fontWeight: 700,
            }}
          >
            Book a Demo
          </a>
        </nav>

        {/* Hero copy */}
        <div
          className="nexus-hero__content"
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            padding: '76px 0 0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '22px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px 6px 6px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.14)',
              fontFamily: 'var(--font-reddit), sans-serif',
              fontSize: '14px',
              color: '#C9D1E0',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)',
                color: '#1A1408',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <span aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1A1408' }} />
              Live
            </span>
            <span>
              <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>U92 Enterprise · Nexus</strong> — the enterprise digital fabric
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-reddit), sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(46px, 7.2vw, 96px)',
              lineHeight: 1,
              letterSpacing: '-.03em',
              color: '#F6F1E6',
            }}
          >
            Less juggling.<br /><span className="nexus-gold">More growing.</span>
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: '780px',
              fontSize: 'clamp(18px, 1.7vw, 21px)',
              lineHeight: 1.6,
              color: '#C9D1E0',
            }}
          >
            Nexus replaces the dozen tools behind your website, apps, portals, support and marketing with{' '}
            <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>one platform</strong>: one sign-in for your team, one record of every customer, one AI that does the busywork, and one bill. Start with three modules. Add the rest as you grow.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', paddingTop: '6px' }}>
            <a
              className="btn btn--metal nexus-btn"
              href="#demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: '56px',
                padding: '0 30px',
                borderRadius: '999px',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 700,
                fontSize: '17px',
              }}
            >
              Book a 30-minute demo
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              className="btn btn--glass nexus-btn nexus-ghost"
              href="#why"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '56px',
                padding: '0 28px',
                borderRadius: '999px',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: '17px',
              }}
            >
              See what changes
            </a>
          </div>

          <ul
            aria-label="What you get"
            style={{
              margin: '6px 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 22px',
              fontFamily: 'var(--font-reddit), sans-serif',
              fontSize: '15.5px',
              color: '#E6EAF2',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              One login for every tool
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Every customer on one screen
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              AI drafts, your team approves
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Pay only for what you switch on
            </li>
          </ul>
        </div>

        {/* Product Workspace Mockup */}
        <div
          className="nexus-hero__content"
          style={{
            maxWidth: '1120px',
            margin: '56px auto 0',
            borderRadius: '18px 18px 0 0',
            padding: '10px 10px 0',
            background: 'linear-gradient(180deg, rgba(221,187,110,.45), rgba(221,187,110,.08))',
            boxShadow: '0 -20px 80px -20px rgba(221,187,110,.25)',
          }}
        >
          <div
            role="img"
            aria-label="Illustration of a Nexus workspace: a sidebar of module groups, a search bar, four overview cards and an action centre"
            style={{
              borderRadius: '12px 12px 0 0',
              background: '#FAF6EE',
              overflow: 'hidden',
              display: 'flex',
              minHeight: '420px',
              fontFamily: 'var(--font-reddit), sans-serif',
            }}
          >
            {/* Sidebar */}
            <div
              className="nexus-mock-side"
              style={{
                width: '232px',
                flex: 'none',
                background: 'linear-gradient(180deg, #0E1F45, #0A1530)',
                padding: '18px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                color: '#C9D1E0',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,.1)',
                    border: '1px solid rgba(255,255,255,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: '#FFFFFF',
                  }}
                >
                  92
                </span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>Nexus</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '10.5px', letterSpacing: '.14em', color: '#DDBB6E', fontWeight: 700, textTransform: 'uppercase', padding: '0 8px 4px' }}>
                  Workspace
                </span>
                <span style={{ padding: '7px 10px', borderRadius: '8px', background: 'rgba(221,187,110,.16)', color: '#FFFFFF' }}>Overview</span>
                <span style={{ padding: '7px 10px' }}>Action centre</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '10.5px', letterSpacing: '.14em', color: '#DDBB6E', fontWeight: 700, textTransform: 'uppercase', padding: '0 8px 4px' }}>
                  Modules
                </span>
                <span style={{ padding: '7px 10px' }}>Digital Experience</span>
                <span style={{ padding: '7px 10px' }}>Brand &amp; Marketing</span>
                <span style={{ padding: '7px 10px' }}>Customer Services</span>
                <span style={{ padding: '7px 10px' }}>Business Portals</span>
                <span style={{ padding: '7px 10px' }}>Service &amp; AI</span>
                <span style={{ padding: '7px 10px' }}>Run &amp; Govern</span>
              </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, minWidth: 0, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(13,26,52,.1)',
                    color: '#6A7290',
                    fontSize: '14px',
                  }}
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                  Search pages, people, tickets, contracts…
                  <span style={{ marginLeft: 'auto', fontSize: '12px', padding: '2px 7px', borderRadius: '6px', background: '#F3EBDC', color: '#5B6380' }}>
                    ⌘K
                  </span>
                </div>
                <span style={{ padding: '8px 14px', borderRadius: '999px', background: '#0E1B36', color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>
                  Ask NexusIQ
                </span>
              </div>

              {/* 4 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
                  <div style={{ fontSize: '12px', color: '#5B6380' }}>New enquiries</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>Inbox</div>
                  <div style={{ fontSize: '12px', color: '#8A6522' }}>Web · App · WhatsApp · Email</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
                  <div style={{ fontSize: '12px', color: '#5B6380' }}>Tickets in SLA</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>On track</div>
                  <div style={{ fontSize: '12px', color: '#8A6522' }}>Support &amp; Services</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
                  <div style={{ fontSize: '12px', color: '#5B6380' }}>Pages scheduled</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>Publish</div>
                  <div style={{ fontSize: '12px', color: '#8A6522' }}>Website CMS</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
                  <div style={{ fontSize: '12px', color: '#5B6380' }}>Agent drafts</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>Approve</div>
                  <div style={{ fontSize: '12px', color: '#8A6522' }}>Agentic Automation</div>
                </div>
              </div>

              {/* Action Centre */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 1px 2px rgba(13,26,52,.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(13,26,52,.08)' }}>
                  <span style={{ fontWeight: 700, color: '#0E1B36', fontSize: '14px' }}>Action centre</span>
                  <span style={{ fontSize: '12px', color: '#5B6380' }}>Across all modules</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(13,26,52,.06)', fontSize: '13.5px', color: '#3A4363' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#F3EBDC', color: '#6E4F18', fontSize: '11.5px', fontWeight: 700 }}>05</span>
                  Enquiry routed to the right branch, SLA timer started
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(13,26,52,.06)', fontSize: '13.5px', color: '#3A4363' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#F3EBDC', color: '#6E4F18', fontSize: '11.5px', fontWeight: 700 }}>17</span>
                  Offer accepted, letter sent for e-signature in Documents
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '11px 0', fontSize: '13.5px', color: '#3A4363' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#F3EBDC', color: '#6E4F18', fontSize: '11.5px', fontWeight: 700 }}>28</span>
                  FAQ drafted by an agent, waiting for your approval
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ VALUE: WHAT CHANGES ============ */}
      <section id="why" aria-labelledby="value-h" style={{ background: '#FAF6EE', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)',
                }}
              />
              What changes with Nexus
            </span>
            <h2
              id="value-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(36px, 4.6vw, 62px)',
                lineHeight: 1.04,
                letterSpacing: '-.025em',
                color: '#0E1B36',
              }}
            >
              Better days for your team.{' '}
              <span className="nexus-goldink">Better results for your business.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '19px', lineHeight: 1.65, color: '#3A4363' }}>
              Most businesses run their customer front door on a site builder, a form tool, a chatbot, a newsletter sender, a few portals and a help desk, each with its own login, bill and copy of the customer. Here is what changes when it all runs on one platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))', gap: '22px', alignItems: 'stretch' }}>
            {/* For your people card */}
            <div
              style={{
                padding: '34px',
                borderRadius: '20px',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(13,26,52,.06), 0 30px 60px -28px rgba(13,26,52,.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '10px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: '#F3EBDC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A6522" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="8" r="3.2" />
                    <path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M15.5 14.2c2.2.1 4 1.7 4.8 4.3" />
                  </svg>
                </span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>
                    For your people
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '15.5px', color: '#5B6380' }}>
                    Less busywork. Fewer logins. No copy-paste.
                  </p>
                </div>
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(13,26,52,.1)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#7A8099', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    A separate login for every tool
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#0E1B36' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    One sign-in for everything they use
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(13,26,52,.1)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#7A8099', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Copying customer details from one system to the next
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#0E1B36' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    Every enquiry, ticket and payment lands on the same customer record
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(13,26,52,.1)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#7A8099', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Waiting on IT to change a page or launch a campaign
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#0E1B36' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    They publish pages, campaigns and portals themselves, with approvals
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(13,26,52,.1)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#7A8099', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Writing every reply, FAQ and translation by hand
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#0E1B36' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    NexusIQ drafts the first version. They review and approve
                  </span>
                </li>
              </ul>
            </div>

            {/* For your business card */}
            <div
              style={{
                padding: '34px',
                borderRadius: '20px',
                background: 'linear-gradient(160deg, #12254D, #0A1530)',
                border: '1px solid rgba(221,187,110,.35)',
                boxShadow: '0 30px 60px -28px rgba(13,26,52,.55)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '10px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(221,187,110,.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V10" />
                    <path d="M10 19V6" />
                    <path d="M16 19v-7" />
                    <path d="M3 19h18" />
                    <path d="M15 6l3-2 2 3" />
                  </svg>
                </span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '26px', fontWeight: 700, color: '#FFFFFF' }}>
                    For your business
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '15.5px', color: '#B9C3D5' }}>
                    Fewer vendors. Faster response. One view of the customer.
                  </p>
                </div>
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#8D97AD', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    A dozen vendors, contracts and renewals
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#FFFFFF' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    One platform, one subscription, one partner
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#8D97AD', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Customers scattered across tools nobody can join up
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#FFFFFF' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    Every customer and every channel in one view, from first visit to renewal
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#8D97AD', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Missed enquiries and SLA breaches found too late
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#FFFFFF' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    Enquiries routed by rule with SLA timers, and breaches flagged before they happen
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#8D97AD', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    Compliance bolted on, tool by tool
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#FFFFFF' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    DPDP consent, audit logs and India-region hosting built in
                  </span>
                </li>

                <li style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                  <span style={{ fontSize: '15px', lineHeight: 1.5, color: '#8D97AD', textDecoration: 'line-through', textDecorationColor: 'rgba(196,154,69,.8)', textDecorationThickness: '2px' }}>
                    A new tool to buy for every new need
                  </span>
                  <span style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '19px', lineHeight: 1.4, fontWeight: 600, color: '#FFFFFF' }}>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '3px' }}>
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                    Switch on the next module when you need it
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px',
              padding: '26px 30px',
              borderRadius: '18px',
              background: '#F3EBDC',
            }}
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 600, color: '#0E1B36' }}>
              See what this looks like for your business, on your own use case.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a
                className="btn btn--metal nexus-btn"
                href="#demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '52px',
                  padding: '0 26px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                Book a demo
              </a>
              <a
                className="btn nexus-btn"
                href="#packages"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '52px',
                  padding: '0 24px',
                  borderRadius: '999px',
                  background: '#0E1B36',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                }}
              >
                Build your package
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FACT STRIP ============ */}
      <section aria-label="Nexus at a glance" style={{ background: '#0E1B36', borderTop: '1px solid rgba(221,187,110,.4)', padding: '30px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', fontFamily: 'var(--font-reddit), sans-serif' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="nexus-gold" style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>37</span>
            <span style={{ color: '#C9D1E0', fontSize: '15px' }}>core modules in six categories</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="nexus-gold" style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>251</span>
            <span style={{ color: '#C9D1E0', fontSize: '15px' }}>capabilities across those modules and add-ons</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="nexus-gold" style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>12</span>
            <span style={{ color: '#C9D1E0', fontSize: '15px' }}>platform features in every package</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="nexus-gold" style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>3</span>
            <span style={{ color: '#C9D1E0', fontSize: '15px' }}>industry add-ons: franchise, investor relations, BFSI risk</span>
          </div>
        </div>
      </section>

      {/* ============ THE FOUR ONES ============ */}
      <section aria-labelledby="ones-h" style={{ background: 'radial-gradient(120% 140% at 0% 0%, #152A52 0%, #0D1A34 55%, #0A1429 100%)', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.14)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#E6EAF2',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              The core promise
            </span>
            <h2
              id="ones-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#F6F1E6',
              }}
            >
              Four things you get <span className="nexus-gold">only once.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#C2CBDB' }}>
              This is the core promise. Everything else on this page follows from it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>One sign-in</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Customers, partners, candidates and staff use one identity across every site, app and portal: OTP, passkeys, Google and LinkedIn sign-in, SAML and OIDC for staff.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.6" strokeLinecap="round">
                <ellipse cx="12" cy="6" rx="7" ry="3" />
                <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
                <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
              </svg>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>One database</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#C2CBDB' }}>
                The Nexus Unified Database holds content and customer records for every module, with one Party Graph per person and company and a full audit log.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
                <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
              </svg>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>One AI layer</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#C2CBDB' }}>
                NexusIQ serves every module: cited answers, drafting, translation, agents and analytics, governed in one place with a human approving what matters.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 15h4" />
              </svg>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>One subscription</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Pay for the modules you switch on, in packages of 3, 6, 12 or 24. Add one module at a time as you grow. Every platform feature is included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MODULE EXPLORER ============ */}
      <section id="modules" style={{ background: '#F3EBDC', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '700px' }}>
              <span
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '5px 16px 5px 5px',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(13,26,52,.08)',
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontSize: '14px',
                  color: '#0E1B36',
                }}
              >
                <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
                The modules
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(34px, 4vw, 54px)',
                  lineHeight: 1.06,
                  letterSpacing: '-.02em',
                  color: '#0E1B36',
                }}
              >
                Switch on <span className="nexus-goldink">only what you need.</span>
              </h2>
              <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#3A4363' }}>
                Browse all 37 modules and the add-ons. Tap <strong style={{ color: '#0E1B36' }}>Add</strong> on the ones you want and we will size your package below.
              </p>
            </div>
            <a
              className="btn btn--ink nexus-btn"
              href="#packages"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: '52px',
                padding: '0 24px',
                borderRadius: '999px',
                background: '#0E1B36',
                color: '#FFFFFF',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              <span>{picked.length ? `Your pick: ${picked.length} ${picked.length === 1 ? 'module' : 'modules'}` : 'Size my package'}</span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M6 13l6 6 6-6" />
              </svg>
            </a>
          </div>

          {/* Category Tabs */}
          <div role="tablist" aria-label="Module categories" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATS.map((c) => {
              const on = c.key === activeCat;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveCat(c.key)}
                  style={{
                    minHeight: '44px',
                    padding: '0 18px',
                    borderRadius: '999px',
                    border: on ? '1px solid #0E1B36' : '1px solid rgba(13,26,52,.18)',
                    background: on ? '#0E1B36' : '#FFFFFF',
                    color: on ? '#FFFFFF' : '#0E1B36',
                    fontFamily: 'var(--font-reddit), sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all .2s',
                  }}
                >
                  {c.name} <span style={{ opacity: 0.75, fontWeight: 500 }}>{c.range}</span>
                </button>
              );
            })}
          </div>

          {/* Category Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid rgba(13,26,52,.14)', paddingBottom: '16px' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '26px', fontWeight: 700, color: '#0E1B36' }}>
              <span>{currentCat.name}</span> <span style={{ color: '#8A6522', fontWeight: 600 }}>{currentCat.range}</span>
            </h3>
            <p style={{ margin: 0, fontSize: '16px', color: '#5B6380' }}>{currentCat.desc}</p>
          </div>

          {/* Modules Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(330px, 100%), 1fr))', gap: '18px' }}>
            {currentCat.mods.map((m) => {
              const isPicked = picked.includes(m.n);
              return (
                <article
                  key={m.n}
                  className="nexus-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: '#FFFDF8',
                    boxShadow: isPicked
                      ? '0 0 0 2px #C49A45, 0 22px 48px -22px rgba(13,26,52,.3)'
                      : '0 1px 2px rgba(13,26,52,.06), 0 22px 48px -22px rgba(13,26,52,.22)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontWeight: 700, fontSize: '15px', color: '#8A6522' }}>{m.n}</span>
                    <span style={getTierStyle(m.tier)}>{m.tier}</span>
                    <button
                      type="button"
                      aria-pressed={isPicked}
                      aria-label={`${isPicked ? 'Remove' : 'Add'} ${m.name} ${isPicked ? 'from' : 'to'} your Nexus`}
                      onClick={() => toggleModule(m.n)}
                      style={{
                        marginLeft: 'auto',
                        minHeight: '36px',
                        minWidth: '72px',
                        padding: '0 14px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-reddit), sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: isPicked
                          ? 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)'
                          : 'transparent',
                        border: isPicked ? '1px solid #B48632' : '1px solid rgba(13,26,52,.28)',
                        color: isPicked ? '#1A1408' : '#0E1B36',
                        transition: 'all .2s',
                      }}
                    >
                      {isPicked ? 'Added' : 'Add'}
                    </button>
                  </div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '21px', fontWeight: 700, lineHeight: 1.2, color: '#0E1B36' }}>
                    {m.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.6, color: '#3A4363' }}>{m.blurb}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {m.subs.map((s) => (
                      <li key={s} style={{ padding: '4px 10px', borderRadius: '999px', background: '#F6EFE2', color: '#4A5373', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ NEXUSIQ ============ */}
      <section id="ai" style={{ background: 'radial-gradient(110% 120% at 100% 0%, #14284F 0%, #0D1A34 55%, #080F22 100%)', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <span
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '5px 16px 5px 5px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.14)',
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontSize: '14px',
                  color: '#E6EAF2',
                }}
              >
                <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
                NexusIQ
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(34px, 4vw, 54px)',
                  lineHeight: 1.06,
                  letterSpacing: '-.02em',
                  color: '#F6F1E6',
                }}
              >
                AI in every module. <span className="nexus-gold">A human on every decision that matters.</span>
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#C2CBDB' }}>
              NexusIQ is one AI layer shared by all modules, so it answers from your approved content, knows the customer record and works inside your rules. Agents draft. People approve. Every action is logged and explainable.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: '#DDBB6E' }}>
                03 · 26
              </span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '21px', fontWeight: 700, color: '#FFFFFF' }}>
                Answers with sources
              </h3>
              <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Site search and an assistant that answer in plain language with citations, fall back to links when unsure and hand off to a person with full context.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: '#DDBB6E' }}>
                28
              </span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '21px', fontWeight: 700, color: '#FFFFFF' }}>
                Agents with an approval queue
              </h3>
              <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Ready-made Follow-up, Router, Summariser and Content-gap agents, plus your own rules. Volume limits, permitted actions and a queue where staff approve, edit or reject.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: '#DDBB6E' }}>
                01 · 06 · 11 · 21
              </span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '21px', fontWeight: 700, color: '#FFFFFF' }}>
                Work that drafts itself
              </h3>
              <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Pages from a brief, posts and digests, translations into Indian languages, weekly sentiment summaries, contract clause extraction and plain-language summaries.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: '#DDBB6E' }}>
                33
              </span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '21px', fontWeight: 700, color: '#FFFFFF' }}>
                AI you can audit
              </h3>
              <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: '#C2CBDB' }}>
                Conversation QA, bias and drift alerts, an explainability log, human-override analytics and model documentation packaged for RBI and DPDP-style reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONNECTED FLOWS ============ */}
      <section aria-labelledby="flows-h" style={{ background: '#FAF6EE', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '44px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Connected by design
            </span>
            <h2
              id="flows-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Modules that <span className="nexus-goldink">finish each other's work.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#3A4363' }}>
              Because every module shares one database, work flows on without exports, re-keying or extra integrations. A few of the flows that run in Nexus today:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FLOWS.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px 14px',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(13,26,52,.06), 0 16px 36px -24px rgba(13,26,52,.25)',
                  fontFamily: 'var(--font-reddit), sans-serif',
                }}
              >
                <span style={{ flex: 'none', padding: '6px 12px', borderRadius: '999px', background: '#0E1B36', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 600 }}>
                  {f.a}
                </span>
                <span style={{ fontSize: '16px', color: '#3A4363' }}>{f.what}</span>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B48632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
                <span style={{ flex: 'none', padding: '6px 12px', borderRadius: '999px', background: '#F3EBDC', color: '#6E4F18', fontSize: '13.5px', fontWeight: 700 }}>
                  {f.b}
                </span>
                <span style={{ fontSize: '16px', color: '#3A4363' }}>{f.result}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOVEREIGN BY DESIGN / TRUST ============ */}
      <section aria-labelledby="trust-h" style={{ background: 'radial-gradient(120% 140% at 0% 100%, #152A52 0%, #0D1A34 55%, #0A1429 100%)', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '780px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.14)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#E6EAF2',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Sovereign by design
            </span>
            <h2
              id="trust-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#F6F1E6',
              }}
            >
              Built for how India does business. <span className="nexus-gold">Ready for everywhere else.</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {TRUST.map((t, idx) => (
              <div key={idx} style={{ background: '#0F1E3E', padding: '26px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{t.title}</h3>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#B9C3D5' }}>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHO IT'S FOR ============ */}
      <section aria-labelledby="roles-h" style={{ background: '#FAF6EE', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Who it is for
            </span>
            <h2
              id="roles-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Different teams. <span className="nexus-goldink">One platform.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#3A4363' }}>
              For startups, SMEs and growing enterprises that want one platform instead of a dozen tools.
            </p>
          </div>

          {/* Role Tabs */}
          <div role="tablist" aria-label="Teams" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ROLES.map((r) => {
              const on = r.key === activeRole;
              return (
                <button
                  key={r.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveRole(r.key)}
                  style={{
                    minHeight: '44px',
                    padding: '0 18px',
                    borderRadius: '999px',
                    border: on ? '1px solid #0E1B36' : '1px solid rgba(13,26,52,.18)',
                    background: on ? '#0E1B36' : '#FFFFFF',
                    color: on ? '#FFFFFF' : '#0E1B36',
                    fontFamily: 'var(--font-reddit), sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all .2s',
                  }}
                >
                  {r.name}
                </button>
              );
            })}
          </div>

          {/* Dynamic Role Content Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
              padding: '36px',
              borderRadius: '18px',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(13,26,52,.06), 0 22px 48px -22px rgba(13,26,52,.25)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '30px', lineHeight: 1.15, fontWeight: 600, color: '#0E1B36' }}>
                {currentRole.head}
              </h3>
              <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.7, color: '#3A4363' }}>{currentRole.body}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '6px' }}>
                {currentRole.mods.map((mod) => (
                  <span key={mod} style={{ padding: '6px 12px', borderRadius: '999px', background: '#0E1B36', color: '#FFFFFF', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13.5px', fontWeight: 500 }}>
                    {mod}
                  </span>
                ))}
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentRole.wins.map((w, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '16.5px', lineHeight: 1.6, color: '#3A4363' }}>
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B48632" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '2px' }}>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Industry link pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5B6380', marginRight: '6px' }}>
              Industries
            </span>
            {[
              { name: 'BFSI', href: '/solutions/industries/bfsi/' },
              { name: 'Healthcare & Pharma', href: '/solutions/industries/healthcare-pharma/' },
              { name: 'Government & PSUs', href: '/solutions/industries/government-psus/' },
              { name: 'Manufacturing', href: '/solutions/industries/manufacturing/' },
              { name: 'Startups & SMEs', href: '/solutions/industries/startups-smes/' },
              { name: 'Retail & E-commerce', href: '/solutions/industries/retail-ecommerce/' },
              { name: 'Education', href: '/solutions/industries/education/' },
              { name: 'Consulting & Services', href: '/solutions/industries/consulting-services/' },
            ].map((ind) => (
              <Link
                key={ind.name}
                href={ind.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid rgba(13,26,52,.18)',
                  color: '#0E1B36',
                  fontFamily: 'var(--font-reddit), sans-serif',
                  fontSize: '14.5px',
                  transition: 'border-color .2s, background-color .2s',
                }}
              >
                {ind.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PACKAGES + BUILDER ============ */}
      <section id="packages" style={{ background: '#F3EBDC', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '780px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Packages
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Priced by <span className="nexus-goldink">how many modules you switch on.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#3A4363' }}>
              Pick a package by module count, add single modules any time, and renew yearly from year two. All twelve platform features come with every package.
            </p>
          </div>

          {/* Package Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {PKGS.map((p) => {
              const isRecommended = bestPkgName === p.name;
              return (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '28px',
                    borderRadius: '18px',
                    background: isRecommended ? 'linear-gradient(160deg, #12254D, #0A1530)' : '#FFFDF8',
                    boxShadow: isRecommended
                      ? '0 0 0 2px #C49A45, 0 30px 60px -24px rgba(13,26,52,.5)'
                      : '0 1px 2px rgba(13,26,52,.06), 0 22px 48px -22px rgba(13,26,52,.22)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '22px', fontWeight: 700, color: isRecommended ? '#FFFFFF' : '#0E1B36' }}>
                      {p.name}
                    </h3>
                    {isRecommended && (
                      <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)', color: '#1A1408', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '12px', fontWeight: 700 }}>
                        Fits your pick
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '15px', fontWeight: 600, color: isRecommended ? '#DDBB6E' : '#8A6522' }}>
                    {p.mods} modules
                  </div>
                  {SHOW_PRICES && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '34px', fontWeight: 700, lineHeight: 1.1, color: isRecommended ? '#FFFFFF' : '#0E1B36' }}>
                        {usd(p.first)}
                      </div>
                      <div style={{ fontSize: '14px', color: isRecommended ? '#B9C3D5' : '#5B6380' }}>
                        first year · then {usd(p.renew)} a year
                      </div>
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: isRecommended ? '#C2CBDB' : '#3A4363' }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <p style={{ margin: '-12px 0 0', fontSize: '14.5px', color: '#5B6380' }}>
            Prices in USD, excluding taxes. Extra modules beyond your package: USD 1,000 each. Your proposal confirms the final scope and price.
          </p>

          {/* Interactive Sizing Builder */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0, borderRadius: '18px', overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(13,26,52,.45)' }}>
            {/* Left: Your Nexus */}
            <div style={{ background: 'linear-gradient(160deg, #12254D, #0A1530)', padding: '34px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#DDBB6E' }}>
                Your Nexus
              </span>
              <div aria-live="polite" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '30px', lineHeight: 1.15, fontWeight: 600, color: '#FFFFFF' }}>
                {bestHead}
              </div>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#C2CBDB' }}>
                {bestDetail}
              </p>

              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pickedNames.map((m) => (
                  <button
                    key={m.n}
                    type="button"
                    aria-label={`Remove ${m.name}`}
                    onClick={() => toggleModule(m.n)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px 6px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,.08)',
                      border: '1px solid rgba(255,255,255,.18)',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-reddit), sans-serif',
                      fontSize: '13.5px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{m.n} {m.name}</span>
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
                <a
                  className="btn btn--metal nexus-btn"
                  href="#demo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '52px',
                    padding: '0 26px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-reddit), sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                  }}
                >
                  {picked.length ? 'Request a proposal for these' : 'Book a demo instead'}
                </a>
                {picked.length > 0 && (
                  <button
                    type="button"
                    className="nexus-ghost"
                    onClick={clearPicked}
                    style={{
                      minHeight: '52px',
                      padding: '0 22px',
                      borderRadius: '999px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,.25)',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-reddit), sans-serif',
                      fontWeight: 600,
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Right: Presets */}
            <div style={{ background: '#FFFDF8', padding: '34px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5B6380' }}>
                Or start from a common first step
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyPreset(p.picks)}
                    style={{
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '16px 18px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(13,26,52,.12)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans), sans-serif',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '17px', fontWeight: 700, color: '#0E1B36' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '14.5px', color: '#5B6380' }}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section aria-labelledby="cmp-h" style={{ background: '#FAF6EE', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Compare the approach
            </span>
            <h2
              id="cmp-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Usual stack <span className="nexus-goldink">vs Nexus.</span>
            </h2>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(13,26,52,.06), 0 22px 48px -22px rgba(13,26,52,.25)' }}>
            <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', fontFamily: 'var(--font-sans), sans-serif', fontSize: '15.5px', color: '#3A4363' }}>
              <thead>
                <tr style={{ background: '#0E1B36', color: '#FFFFFF', fontFamily: 'var(--font-reddit), sans-serif', textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '18px 22px', fontWeight: 600, width: '28%' }}>What you need</th>
                  <th scope="col" style={{ padding: '18px 22px', fontWeight: 600 }}>Point tools stitched together</th>
                  <th scope="col" style={{ padding: '18px 22px', fontWeight: 600 }}>Large enterprise suites</th>
                  <th scope="col" style={{ padding: '18px 22px', fontWeight: 700, color: '#F1D894' }}>U92 Nexus</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(13,26,52,.08)' }}>
                    <th scope="row" style={{ padding: '16px 22px', textAlign: 'left', fontFamily: 'var(--font-reddit), sans-serif', fontWeight: 600, color: '#0E1B36' }}>
                      {r.k}
                    </th>
                    <td style={{ padding: '16px 22px' }}>{r.a}</td>
                    <td style={{ padding: '16px 22px' }}>{r.b}</td>
                    <td style={{ padding: '16px 22px', background: '#FBF6EA', color: '#0E1B36', fontWeight: 500 }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ HOW TO START + WHAT'S NEXT ============ */}
      <section aria-labelledby="start-h" style={{ background: '#F3EBDC', padding: '120px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '44px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              How to start
            </span>
            <h2
              id="start-h"
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Small first step. <span className="nexus-goldink">Then grow module by module.</span>
            </h2>
          </div>

          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '24px' }}>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '22px', borderTop: '2px solid #C49A45' }}>
              <span className="nexus-goldink" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '34px', fontWeight: 700, lineHeight: 1 }}>01</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '20px', fontWeight: 700, color: '#0E1B36' }}>See it on your use case</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#3A4363' }}>A 30-minute demo shaped around what you want to launch first.</p>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '22px', borderTop: '2px solid #C49A45' }}>
              <span className="nexus-goldink" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '34px', fontWeight: 700, lineHeight: 1 }}>02</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '20px', fontWeight: 700, color: '#0E1B36' }}>Agree a fixed-scope first step</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#3A4363' }}>Choose a package and the modules in it. You judge our work before you commit to more.</p>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '22px', borderTop: '2px solid #C49A45' }}>
              <span className="nexus-goldink" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '34px', fontWeight: 700, lineHeight: 1 }}>03</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '20px', fontWeight: 700, color: '#0E1B36' }}>Launch from a sandbox</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#3A4363' }}>Configure and test in your own sandbox, promote to production, roll back in one click if needed.</p>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '22px', borderTop: '2px dashed #C49A45' }}>
              <span className="nexus-goldink" style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '34px', fontWeight: 700, lineHeight: 1 }}>04</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '20px', fontWeight: 700, color: '#0E1B36' }}>Grow when you are ready</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.65, color: '#3A4363' }}>Switch on the next module. Your data, users and branding are already there.</p>
            </li>
          </ol>

          {/* Coming next to Nexus */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', padding: '30px', borderRadius: '18px', background: '#FFFDF8', border: '1px solid rgba(13,26,52,.08)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5B6380' }}>
                Coming next to Nexus
              </span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-reddit), sans-serif', fontSize: '24px', fontWeight: 600, color: '#0E1B36' }}>
                Growth and intelligence
              </h3>
              <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: '#3A4363' }}>
                Two new modules are in build. We label every product by its real maturity.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontWeight: 700, fontSize: '18px', color: '#0E1B36' }}>Searchlight</span>
                <span style={{ padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(13,26,52,.25)', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '12px', fontWeight: 600, color: '#4A5373' }}>
                  In build
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#3A4363' }}>
                Tracks news, funding, filings and leadership changes at your customers, competitors, investors and prospects, and tells the right person in time.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(13,26,52,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-reddit), sans-serif', fontWeight: 700, fontSize: '18px', color: '#0E1B36' }}>Pipeline builder</span>
                <span style={{ padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(13,26,52,.25)', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '12px', fontWeight: 600, color: '#4A5373' }}>
                  In build
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#3A4363' }}>
                Finds companies that fit each product you sell, scores and routes them, and runs consent-aware outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" style={{ background: '#FAF6EE', padding: '120px 24px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(13,26,52,.08)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#0E1B36',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              FAQ
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(34px, 4vw, 54px)',
                lineHeight: 1.06,
                letterSpacing: '-.02em',
                color: '#0E1B36',
              }}
            >
              Questions buyers ask us.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(13,26,52,.16)' }}>
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(13,26,52,.16)' }}>
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        padding: '22px 0',
                        background: 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-reddit), sans-serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#0E1B36',
                      }}
                    >
                      {f.q}
                      <span
                        aria-hidden="true"
                        style={{
                          flex: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1px solid rgba(13,26,52,.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#8A6522',
                          transition: 'transform .2s',
                          transform: isOpen ? 'rotate(45deg)' : 'none',
                        }}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <p
                      id={`faq-a-${i}`}
                      style={{
                        margin: 0,
                        padding: '0 40px 24px 0',
                        fontSize: '17px',
                        lineHeight: 1.7,
                        color: '#3A4363',
                      }}
                    >
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA + DEMO FORM ============ */}
      <section
        id="demo"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(120% 120% at 50% 0%, #12254D 0%, #0A1530 50%, #060B18 100%)',
          padding: '120px 24px',
        }}
      >
        <div style={{ position: 'relative', maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '56px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 16px 5px 5px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.14)',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontSize: '14px',
                color: '#E6EAF2',
              }}
            >
              <span aria-hidden="true" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(118deg, #C99D48, #F2DA98 45%, #D6B163)' }} />
              Book a demo
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(36px, 4.4vw, 58px)',
                lineHeight: 1.04,
                letterSpacing: '-.02em',
                color: '#F6F1E6',
              }}
            >
              See Nexus run <span className="nexus-gold">your front door.</span>
            </h2>
            <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.7, color: '#C2CBDB' }}>
              Tell us what you want to launch first. We will show it working in a 30-minute demo and suggest a small, fixed-scope first step.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '6px', fontFamily: 'var(--font-reddit), sans-serif' }}>
              <a
                href="mailto:contact@uelement.co?subject=Nexus%20demo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                }}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                contact@uelement.co
              </a>
              <a
                href="https://wa.me/917620690561"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                }}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DDBB6E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12z" />
                </svg>
                WhatsApp +91 76206 90561
              </a>
            </div>
          </div>

          <form
            id="demoForm"
            aria-label="Book a Nexus demo"
            onSubmit={handleFormSubmit}
            noValidate
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '32px',
              borderRadius: '20px',
              background: '#FFFDF8',
              boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
                Full name
                <input
                  type="text"
                  name="name"
                  id="f-name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    minHeight: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(13,26,52,.18)',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '16px',
                    color: '#0E1B36',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
                Work email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    minHeight: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(13,26,52,.18)',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '16px',
                    color: '#0E1B36',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
                Company
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{
                    minHeight: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(13,26,52,.18)',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '16px',
                    color: '#0E1B36',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
                Phone or WhatsApp
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    minHeight: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(13,26,52,.18)',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '16px',
                    color: '#0E1B36',
                  }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
              What do you want to launch first?
              <select
                name="first"
                value={formData.first}
                onChange={(e) => setFormData({ ...formData, first: e.target.value })}
                style={{
                  minHeight: '48px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(13,26,52,.18)',
                  background: '#FFFFFF',
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '16px',
                  color: '#0E1B36',
                }}
              >
                <option>Website and enquiries</option>
                <option>Customer or member portal</option>
                <option>Support desk and AI assistant</option>
                <option>Careers and employee portals</option>
                <option>Partner, dealer or vendor portal</option>
                <option>Brand, social and campaigns</option>
                <option>Not sure yet</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-reddit), sans-serif', fontSize: '14px', fontWeight: 600, color: '#0E1B36' }}>
              Modules you picked
              <input
                type="text"
                name="modules"
                value={pickedModulesString}
                readOnly
                style={{
                  minHeight: '48px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(13,26,52,.12)',
                  background: '#F6EFE2',
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '15px',
                  color: '#3A4363',
                }}
              />
            </label>

            {formMsg && (
              <p
                role="status"
                style={{
                  margin: 0,
                  fontSize: '15px',
                  color: formMsg.isError ? '#9A3412' : '#6E4F18',
                  fontWeight: 600,
                }}
              >
                {formMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--metal nexus-btn"
              style={{
                minHeight: '56px',
                border: 0,
                borderRadius: '999px',
                fontFamily: 'var(--font-reddit), sans-serif',
                fontWeight: 700,
                fontSize: '17px',
                cursor: 'pointer',
              }}
            >
              Book my demo
            </button>

            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: '#5B6380' }}>
              We use these details only to arrange your demo. See our{' '}
              <Link href="/privacy/" style={{ color: '#8A6522', textDecoration: 'underline' }}>
                privacy policy
              </Link>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
