'use client';

import { useEffect, useRef } from 'react';

export default function VizorPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (window.location.hash && iframeRef.current) {
      iframeRef.current.src = `/vizor/index.html${window.location.hash}`;
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        width: '100vw',
        height: '100vh',
        background: '#0a0f1d',
      }}
    >
      <iframe
        ref={iframeRef}
        src="/vizor/index.html"
        title="Vizor xBOM"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}
