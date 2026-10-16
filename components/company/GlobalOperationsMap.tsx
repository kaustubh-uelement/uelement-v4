'use client';

import dynamic from 'next/dynamic';

const GlobalOperationsGlobe = dynamic(
  () => import('./GlobalOperationsGlobe'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          height: 'clamp(320px, 48vh, 600px)',
          margin: '24px auto 0',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
          fontSize: 14,
        }}
      >
        Loading Global Operations Map...
      </div>
    ),
  }
);

export default function GlobalOperationsMap() {
  return <GlobalOperationsGlobe />;
}
