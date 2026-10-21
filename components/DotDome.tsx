'use client';

import { useEffect, useRef, CSSProperties } from 'react';

// A slowly turning sphere of gold dots, drawn on canvas. Used behind inner page headings.
export function DotDome({
  density = 6400,
  className,
  style,
  static: isStatic = false,
  angle: initialAngle = 0.6,
}: {
  density?: number;
  className?: string;
  style?: CSSProperties;
  static?: boolean;
  angle?: number;
}) {
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

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, angle = initialAngle;
    // Pitch forward toward viewer
    const pitch = -(20 * Math.PI) / 180;
    // Tilt the globe's rotating axis by 33 degrees to the right
    const roll = (33 * Math.PI) / 180;

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
      // Main sphere radius
      const R = Math.min(w, h) * 0.44;
      const cx = w / 2, cy = h / 2;
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cr = Math.cos(roll), sr = Math.sin(roll);

      for (let i = 0; i < n; i++) {
        const [x0, y0, z0] = pts[i];
        // 1. Rotate around polar Y axis (spin)
        const x1 = x0 * ca + z0 * sa;
        const y1 = y0;
        const z1 = -x0 * sa + z0 * ca;

        // 2. Pitch forward around X
        const y2 = y1 * cp - z1 * sp;
        const z2 = y1 * sp + z1 * cp;
        const x2 = x1;

        // 3. Roll around Z: tilt rotating axis by 33 degrees to the right
        const x3 = x2 * cr - y2 * sr;
        const y3 = x2 * sr + y2 * cr;
        const z3 = z2;

        const depth = (z3 + 1) / 2; // 0 back, 1 front
        if (depth < 0.28) continue;
        const px = cx + x3 * R;
        const py = cy + y3 * R;
        const a = Math.pow(depth, 2.2) * 0.95;
        // Dot radius
        const s = 0.8 + depth * 1.8;
        // Brighter near the upper-left light source
        const light = Math.max(0, (-x3 * 0.5 - y3 * 0.6 + z3 * 0.8));
        const rC = 196 + Math.round(45 * light), gC = 154 + Math.round(62 * light), bC = 69 + Math.round(78 * light);
        ctx.fillStyle = `rgba(${rC},${gC},${bC},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!isStatic && visible) {
        angle += 0.0016;
        draw();
        raf = requestAnimationFrame(loop);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!isStatic && visible && !raf) {
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    resize();

    if (!isStatic) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density, isStatic, initialAngle]);

  return <canvas ref={ref} className={className} style={style} />;
}
