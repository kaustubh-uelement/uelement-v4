import type { Metadata } from 'next';
import { VyuProductView } from '@/components/VyuProductView';

export const metadata: Metadata = {
  title: 'U92-Vyu | Free Quantum Readiness & CBOM Scanner',
  description:
    'Find the cryptography in your website, API or public GitHub code that a quantum computer will break, score how exposed you are, and get a signed CycloneDX CBOM report.',
  alternates: { canonical: '/vyu/' },
};

export default function VyuPage() {
  return <VyuProductView />;
}
