import { allProducts, services } from './content';

export type Field = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  hint?: string;
  autoComplete?: string;
  wide?: boolean;
};

const productOptions = [...allProducts().map((p) => `${p.name} (${p.platform.name})`), 'Not sure yet'];
const serviceOptions = [...services.map((s) => s.name), 'Not sure yet'];

const who: Field[] = [
  { name: 'name', label: 'Your name', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'company', label: 'Organisation', type: 'text', autoComplete: 'organization' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', hint: 'Optional' },
];

export type FormKind = 'contact' | 'demo' | 'quote' | 'support' | 'suggestion' | 'partner' | 'portal' | 'investor' | 'notify';

export const forms: Record<FormKind, { subject: string; submit: string; fields: Field[] }> = {
  contact: {
    subject: 'Enquiry',
    submit: 'Send message',
    fields: [
      ...who,
      { name: 'topic', label: 'What is it about?', type: 'select', options: ['A project or product', 'Partnerships', 'Careers', 'Investors', 'Media', 'Something else'] },
      { name: 'message', label: 'Message', type: 'textarea', required: true, wide: true },
    ],
  },
  demo: {
    subject: 'Demo request',
    submit: 'Request a demo',
    fields: [
      ...who,
      { name: 'product', label: 'Which product?', type: 'select', options: productOptions, required: true },
      { name: 'message', label: 'What would you like to see?', type: 'textarea', wide: true, hint: 'Tell us about your environment and what a good demo would show.' },
    ],
  },
  quote: {
    subject: 'Service quote request',
    submit: 'Request a quote',
    fields: [
      ...who,
      { name: 'service', label: 'Service', type: 'select', options: serviceOptions, required: true },
      { name: 'timeline', label: 'When do you want to start?', type: 'select', options: ['Within a month', 'In one to three months', 'Later this year', 'Just exploring'] },
      { name: 'message', label: 'Scope', type: 'textarea', required: true, wide: true, hint: 'What needs doing, for which systems, and any deadline we should know about.' },
    ],
  },
  support: {
    subject: 'Support request',
    submit: 'Send to support',
    fields: [
      ...who.slice(0, 3),
      { name: 'product', label: 'Product', type: 'select', options: productOptions, required: true },
      { name: 'severity', label: 'How serious is it?', type: 'select', required: true, options: ['Service is down', 'A major feature is not working', 'Something is wrong but there is a workaround', 'A question'] },
      { name: 'message', label: 'What happened?', type: 'textarea', required: true, wide: true, hint: 'Include what you expected, what you saw, and when it started.' },
    ],
  },
  suggestion: {
    subject: 'Suggestion',
    submit: 'Send suggestion',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', hint: 'Optional', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', hint: 'Optional, if you would like a reply', autoComplete: 'email' },
      { name: 'area', label: 'About', type: 'select', options: ['A product', 'This website', 'Our services', 'Something else'] },
      { name: 'message', label: 'Your suggestion', type: 'textarea', required: true, wide: true },
    ],
  },
  partner: {
    subject: 'Partnership enquiry',
    submit: 'Send enquiry',
    fields: [
      ...who.slice(0, 3),
      { name: 'website', label: 'Website', type: 'url', autoComplete: 'url' },
      { name: 'type', label: 'Partnership type', type: 'select', required: true, options: ['Value added reseller', 'Technology alliance', 'Go-to-market partnership', 'Not sure yet'] },
      { name: 'message', label: 'Tell us about your business', type: 'textarea', required: true, wide: true, hint: 'Your customers, regions and what you would like to build together.' },
    ],
  },
  portal: {
    subject: 'Customer portal access',
    submit: 'Request access',
    fields: [
      ...who.slice(0, 3),
      { name: 'product', label: 'Product you use', type: 'select', options: productOptions, required: true },
      { name: 'message', label: 'Anything else', type: 'textarea', wide: true },
    ],
  },
  investor: {
    subject: 'Investor enquiry',
    submit: 'Send enquiry',
    fields: [
      ...who.slice(0, 3),
      { name: 'message', label: 'Message', type: 'textarea', required: true, wide: true },
    ],
  },
  notify: {
    subject: 'Keep me posted',
    submit: 'Keep me posted',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', required: true, autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
    ],
  },
};
