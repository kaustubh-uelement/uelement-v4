'use client';

import { useEffect, useRef } from 'react';

// A slowly turning sphere of gold dots, drawn on canvas. Used behind inner page headings.
export function DotDome({ density = 1400 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = density;
    // Fibonacci sphere
    const pts: [number, number, number][] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = g * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, angle = 0.6;
    const tilt = -0.42;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h / 2;
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      for (let i = 0; i < n; i++) {
        const [x0, y0, z0] = pts[i];
        // rotate around Y
        const x1 = x0 * ca + z0 * sa;
        const z1 = -x0 * sa + z0 * ca;
        // tilt around X
        const y2 = y0 * ct - z1 * st;
        const z2 = y0 * st + z1 * ct;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        if (depth < 0.3) continue;
        const px = cx + x1 * R;
        const py = cy + y2 * R;
        const a = Math.pow(depth, 2.2) * 0.95;
        const s = 0.5 + depth * 1.35;
        // brighter near the upper-left light source
        const light = Math.max(0, (-x1 * 0.5 - y2 * 0.6 + z2 * 0.8));
        const rC = 196 + Math.round(45 * light), gC = 154 + Math.round(62 * light), bC = 69 + Math.round(78 * light);
        ctx.fillStyle = `rgba(${rC},${gC},${bC},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (visible) {
        angle += 0.0016;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} />;
}
