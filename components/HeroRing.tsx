'use client';

import { useEffect, useRef } from 'react';

// The Home hero's signature: a segmented gold ring rising from the bottom edge,
// a slow light sweep across its ticks, and gold sparks lifting off it into a starfield.
// Geometry (viewBox 0 300 1600 620, cropped to the top of the circle): ring centre (800, 1060), radius 760.
const VB_W = 1600;
const VB_Y = 200;
const VB_H = 700;
const CX = 800;
const CY = 1060;
const R = 760;
const TICKS = '2.4 7.6';

export function HeroSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const wrap = hero?.querySelector<HTMLElement>('.hero__ring');
    if (!canvas || !wrap || !hero) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    let ring = { cx: 0, cy: 0, r: 0 };
    const start = performance.now();

    type Star = { x: number; y: number; s: number; p: number; f: number };
    let stars: Star[] = [];
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; s: number };
    const sparks: Spark[] = [];

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = wrap.offsetWidth;
      const k = W / VB_W;
      const top = wrap.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      ring = { cx: w / 2, cy: top + (CY - VB_Y) * k, r: R * k };
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() < 0.08 ? 1.3 + Math.random() * 0.7 : 0.4 + Math.random() * 0.7,
        p: Math.random() * Math.PI * 2,
        f: 0.4 + Math.random() * 1.4,
      }));
    };

    const emit = () => {
      // Pick a point on the visible upper arc, weighted toward the top.
      const t = (Math.random() + Math.random() - 1) * 1.25; // radians from vertical
      const nx = Math.sin(t), ny = -Math.cos(t);
      const jitter = (Math.random() - 0.5) * ring.r * 0.05;
      sparks.push({
        x: ring.cx + nx * (ring.r + jitter),
        y: ring.cy + ny * (ring.r + jitter),
        vx: nx * (6 + Math.random() * 14) + (Math.random() - 0.5) * 6,
        vy: ny * (10 + Math.random() * 18) - (8 + Math.random() * 16),
        life: 2.2 + Math.random() * 3.2,
        age: 0,
        s: 0.6 + Math.random() * 1.5,
      });
    };

    let last = performance.now();
    let acc = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const dx = s.x - ring.cx, dy = s.y - ring.cy;
        const inside = Math.hypot(dx, dy) < ring.r - 30;
        const tw = reduce ? 0.7 : 0.55 + 0.45 * Math.sin(t * s.f + s.p);
        const a = (inside ? 0.25 : 0.7) * tw * (s.y < h * 0.12 ? 0.5 : 1);
        ctx.fillStyle = `rgba(232, 226, 210, ${a.toFixed(3)})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }

      if (!reduce && t > 1.4) {
        acc += dt;
        const rate = w < 700 ? 0.09 : 0.05;
        while (acc > rate) { emit(); acc -= rate; }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.age += dt;
        if (p.age > p.life) { sparks.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.995;
        const k = p.age / p.life;
        const a = Math.sin(Math.PI * Math.min(1, k)) * 0.9;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4);
        g.addColorStop(0, `rgba(255, 240, 196, ${a.toFixed(3)})`);
        g.addColorStop(0.35, `rgba(241, 216, 148, ${(a * 0.45).toFixed(3)})`);
        g.addColorStop(1, 'rgba(196, 154, 69, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(() => { measure(); if (reduce) frame(performance.now()); });
    ro.observe(hero);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    io.observe(hero);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__sparks" aria-hidden="true" />;
}

export function HeroRing() {
  return (
    <div className="hero__ring" aria-hidden="true">
      <div className="ring-rise">
        <svg viewBox={`0 ${VB_Y} ${VB_W} ${VB_H}`} fill="none">
            <defs>
              <linearGradient id="hr-tick" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="820">
                <stop offset="0" stopColor="#FFF4D0" />
                <stop offset=".22" stopColor="#F1D894" />
                <stop offset=".55" stopColor="#C49A45" stopOpacity=".75" />
                <stop offset="1" stopColor="#8A6522" stopOpacity=".15" />
              </linearGradient>
              <radialGradient id="hr-fade" gradientUnits="userSpaceOnUse" cx="800" cy="300" r="760">
                <stop offset="0" stopColor="#fff" />
                <stop offset=".55" stopColor="#fff" stopOpacity=".75" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hr-core" gradientUnits="userSpaceOnUse" cx="800" cy="320" r="720">
                <stop offset="0" stopColor="#C49A45" stopOpacity=".16" />
                <stop offset=".5" stopColor="#0D1A34" stopOpacity=".2" />
                <stop offset="1" stopColor="#050A16" stopOpacity="0" />
              </radialGradient>
              <mask id="hr-mask" maskUnits="userSpaceOnUse" x="-400" y="-200" width="2400" height="1400">
                <rect x="-400" y="-200" width="2400" height="1400" fill="url(#hr-fade)" />
              </mask>
              <mask id="hr-ticks" maskUnits="userSpaceOnUse" x="0" y={VB_Y} width={VB_W} height={VB_H}>
                <circle cx={CX} cy={CY} r={R} stroke="#fff" strokeWidth="58" strokeDasharray={TICKS} />
              </mask>
              <filter id="hr-blur-xl" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="46" />
              </filter>
              <filter id="hr-blur-md" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id="hr-blur-sm" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            <g mask="url(#hr-mask)">
              {/* interior haze */}
              <circle cx={CX} cy={CY} r={R - 40} fill="url(#hr-core)" />

              {/* halo */}
              <circle className="ring-breathe" cx={CX} cy={CY} r={R} stroke="#DDBB6E" strokeOpacity=".28" strokeWidth="190" filter="url(#hr-blur-xl)" />

              {/* fine rotating inner rings */}
              <g className="ring-spin">
                <circle cx={CX} cy={CY} r={R - 72} stroke="#C49A45" strokeOpacity=".5" strokeWidth="12" strokeDasharray="1.2 12" />
              </g>
              <g className="ring-spin ring-spin--rev">
                <circle cx={CX} cy={CY} r={R - 118} stroke="#DDBB6E" strokeOpacity=".35" strokeWidth="2" strokeDasharray="140 50 24 50" />
              </g>
              <circle cx={CX} cy={CY} r={R - 150} stroke="#C49A45" strokeOpacity=".16" strokeWidth="1" />

              {/* segmented ring */}
              <circle cx={CX} cy={CY} r={R} stroke="url(#hr-tick)" strokeWidth="58" strokeDasharray={TICKS} filter="url(#hr-blur-sm)" opacity=".7" />
              <circle cx={CX} cy={CY} r={R} stroke="url(#hr-tick)" strokeWidth="58" strokeDasharray={TICKS} />

              {/* edges */}
              <circle cx={CX} cy={CY} r={R - 31} stroke="#F6E3A6" strokeWidth="6" strokeOpacity=".55" filter="url(#hr-blur-sm)" />
              <circle cx={CX} cy={CY} r={R - 31} stroke="#FFF4D0" strokeWidth="1.6" />
              <circle cx={CX} cy={CY} r={R + 33} stroke="#DDBB6E" strokeOpacity=".45" strokeWidth="1" />
              <circle cx={CX} cy={CY} r={R + 52} stroke="#DDBB6E" strokeOpacity=".18" strokeWidth="1" strokeDasharray="2 10" />

              {/* light sweep, masked to the ticks so it reads as the segments lighting up */}
              <g mask="url(#hr-ticks)">
                <g className="ring-sweep">
                  <circle
                    cx={CX}
                    cy={CY}
                    r={R}
                    stroke="#FFFBEA"
                    strokeWidth="60"
                    strokeDasharray="360 6000"
                    strokeDashoffset="180"
                    transform={`rotate(-90 ${CX} ${CY})`}
                  />
                </g>
              </g>
              <g className="ring-sweep">
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke="#F6E3A6"
                  strokeOpacity=".3"
                  strokeWidth="76"
                  strokeDasharray="300 6000"
                  strokeDashoffset="150"
                  transform={`rotate(-90 ${CX} ${CY})`}
                  filter="url(#hr-blur-md)"
                />
              </g>
            </g>
          </svg>
      </div>
    </div>
  );
}
