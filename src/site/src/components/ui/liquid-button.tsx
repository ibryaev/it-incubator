"use client";
import React, { useRef, useState, useEffect } from "react";

const MATTE_NOISE = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const LiquidButton = ({ children, className = "", ...props }: LiquidButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [filterId] = useState(() => `liquid-btn-${Math.random().toString(36).substr(2, 9)}`);
  const [svgDefs, setSvgDefs] = useState<React.ReactNode>(null);
  const [useHeavyRender, setUseHeavyRender] = useState(false);

  useEffect(() => {
    // Включаем тяжелый SVG-рендеринг только на ПК в Chrome/Edge
    const checkCapabilities = () => {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isDesktop = window.innerWidth >= 768;
      setUseHeavyRender(isChrome && isDesktop);
    };

    checkCapabilities();
    window.addEventListener("resize", checkCapabilities);
    return () => window.removeEventListener("resize", checkCapabilities);
  }, []);

  useEffect(() => {
    if (!useHeavyRender || !buttonRef.current) return;

    let timeout: NodeJS.Timeout;

    const generateFilters = () => {
      if (!buttonRef.current) return;
      const w = buttonRef.current.offsetWidth;
      const h = buttonRef.current.offsetHeight;
      
      const radius = Math.min(24, w / 2, h / 2);
      const bezelW = Math.max(1, Math.min(20, radius - 1));
      const glassThick = 25;
      const ior = 1.5;
      const scaleMult = 3.0;
      const blurAmt = 6;
      
      const heightFn = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);
      const profile = new Float64Array(128);
      const eta = 1 / ior;
      
      for (let i = 0; i < 128; i++) {
        const x = i / 128;
        const y = heightFn(x);
        const dx = -0.0001;
        const deriv = (heightFn(x + dx) - y) / dx;
        const mag = Math.sqrt(deriv * deriv + 1);
        const nx = -deriv / mag;
        const ny = -1 / mag;
        const dot = ny;
        const k = 1 - eta * eta * (1 - dot * dot);
        if (k >= 0) {
          const sq = Math.sqrt(k);
          const rx = -(eta * dot + sq) * nx;
          const ry = eta - (eta * dot + sq) * ny;
          profile[i] = rx * ((y * bezelW + glassThick) / ry);
        }
      }

      const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255; }
      
      const rSq = radius * radius;
      const r1Sq = (radius + 1) ** 2;
      const rBSq = Math.max(radius - bezelW, 0) ** 2;
      const wB = w - radius * 2;
      const hB = h - radius * 2;

      for (let y1 = 0; y1 < h; y1++) {
        for (let x1 = 0; x1 < w; x1++) {
          const x = x1 < radius ? x1 - radius : x1 >= w - radius ? x1 - radius - wB : 0;
          const y = y1 < radius ? y1 - radius : y1 >= h - radius ? y1 - radius - hB : 0;
          const dSq = x * x + y * y;
          if (dSq > r1Sq || dSq < rBSq) continue;
          const dist = Math.sqrt(dSq);
          const fromSide = radius - dist;
          const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
          if (op <= 0 || dist === 0) continue;
          
          const bi = Math.min(((fromSide / bezelW) * 128) | 0, 127);
          const disp = profile[bi] || 0;
          const dX = (-(x / dist) * disp) / maxDisp;
          const dY = (-(y / dist) * disp) / maxDisp;
          
          const idx = (y1 * w + x1) * 4;
          d[idx] = (128 + dX * 127 * op + 0.5) | 0;
          d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
        }
      }
      ctx.putImageData(img, 0, 0);
      
      setSvgDefs(
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmt} result="blurred" />
          <feImage href={c.toDataURL()} x="0" y="0" width={w} height={h} result="disp_map" />
          <feDisplacementMap in="blurred" in2="disp_map" scale={maxDisp * scaleMult} xChannelSelector="R" yChannelSelector="G" result="displaced" />
        </filter>
      );
    };

    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(generateFilters, 15); 
    });
    observer.observe(buttonRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [useHeavyRender, filterId]);

  // --- ЛЕГКАЯ ВЕРСИЯ (ТЕЛЕФОНЫ / НЕ-CHROME) ---
  if (!useHeavyRender) {
    return (
      <button 
        // ДОБАВЛЕНЫ ДЕФОЛТНЫЕ КЛАССЫ: text-[13px] font-semibold uppercase tracking-wider py-3.5 px-8
        className={`relative flex items-center justify-center rounded-full border border-white/[0.05] bg-[#141419]/60 backdrop-blur-xl shadow-lg transition-all duration-300 text-white text-[13px] font-semibold uppercase tracking-wider py-3.5 px-8 ${className}`}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  // --- ТЯЖЕЛАЯ ВЕРСИЯ (ПК) ---
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" className="absolute pointer-events-none">
        <defs>{svgDefs}</defs>
      </svg>
      <button 
        ref={buttonRef}
        // ДОБАВЛЕНЫ ДЕФОЛТНЫЕ КЛАССЫ: text-[13px] font-semibold uppercase tracking-wider py-3.5 px-8
        className={`relative flex items-center justify-center rounded-full border border-white/[0.04] overflow-hidden transition-all duration-300 text-white text-[13px] font-semibold uppercase tracking-wider py-3.5 px-8 ${className}`}
        style={{
          background: "rgba(20, 20, 25, 0.2)",
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
        {...props}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: `url("${MATTE_NOISE}")` }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    </>
  );
};