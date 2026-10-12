import type { Metadata } from 'next';
import ProductPage, { generateMetadata as generateProductMetadata } from '../platforms/[platform]/[product]/page';

export async function generateMetadata(): Promise<Metadata> {
  return generateProductMetadata({
    params: Promise.resolve({ platform: 'u92-quantum', product: 'vyu' }),
  });
}

export default async function VyuPage() {
  return (
    <ProductPage
      params={Promise.resolve({ platform: 'u92-quantum', product: 'vyu' })}
    />
  );
}
