import type { Metadata } from 'next';
import { BrandClient } from './BrandClient';
import { company } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Brand Guidelines',
  description: 'How UElement looks, sounds and names things. Core identity rules for team members, partners, resellers and the press.',
  alternates: { canonical: '/company/brand/' },
};

export default function BrandPage() {
  return <BrandClient />;
}
