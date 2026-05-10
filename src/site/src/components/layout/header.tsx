"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { ChevronDown } from "lucide-react";

// --- Секретный ингредиент матового стекла: микро-текстура (SVG-шум) ---
const MATTE_NOISE = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

const LiquidPill = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const pillRef = useRef<HTMLDivElement>(null);
  const [filterId] = useState(() => `liquid-pill-${Math.random().toString(36).substr(2, 9)}`);
  const [svgDefs, setSvgDefs] = useState<React.ReactNode>(null);
  const [isChromium, setIsChromium] = useState(false);

  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChromium(isChrome);
    if (!isChrome || !pillRef.current) return;

    let timeout: NodeJS.Timeout;

    const generateFilters = () => {
      if (!pillRef.current) return;
      const w = pillRef.current.offsetWidth;
      const h = pillRef.current.offsetHeight;
      
      const radius = Math.min(28, w / 2, h / 2);
      const bezelW = Math.max(1, Math.min(25, radius - 1));
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
    observer.observe(pillRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [filterId]);

  return (
    <div className="relative h-full flex">
      {isChromium && (
        <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" className="absolute pointer-events-none">
          <defs>{svgDefs}</defs>
        </svg>
      )}
      <div 
        ref={pillRef}
        className={`relative rounded-[28px] border border-white/[0.04] overflow-hidden transition-all duration-300 w-full ${className}`}
        style={
          isChromium
            ? {
                background: "rgba(20, 20, 25, 0.2)",
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }
            : {
                background: "rgba(20, 20, 25, 0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }
        }
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: `url("${MATTE_NOISE}")` }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ HEADER ---
export const Header = () => {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  
  const [activeScope, animateActive] = useAnimate();
  const isFirstRender = useRef(true);

  const[hoverStyle, setHoverStyle] = useState<{ left: number; width: number } | null>(null);
  const[isHovered, setIsHovered] = useState(false);

  const navItems =[
    { name: "О нас", path: "/about" },
    { name: "Команда", path: "/team" },
    { name: "Контакты", path: "/contacts" },
  ];

  // Если мы на главной странице (или другой, которой нет в списке), пишем "Меню" в мобилке
  const currentTab = navItems.find((item) => item.path === pathname) || { name: "Меню", path: "/" };

  useEffect(() => {
    if (!navRef.current || !activeScope.current) return;

    const activeEl = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
    
    // === НОВАЯ ЛОГИКА ===
    // Если активной вкладки нет (например, перешли на главную), плавно скрываем ползунок
    if (!activeEl) {
      animateActive(activeScope.current, { opacity: 0 }, { duration: 0.3 });
      return;
    }

    if (isFirstRender.current) {
      // При первой загрузке страницы (сразу на нужной вкладке) ставим ползунок на место мгновенно
      animateActive(activeScope.current, {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      }, { duration: 0 });
      isFirstRender.current = false;
    } else {
      // При клике по ссылке анимируем плавно. 
      // Если возвращаемся с главной страницы, он плавно появится (opacity 1) и доедет куда надо
      animateActive(activeScope.current, {
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      }, { type: "spring", stiffness: 400, damping: 30 });
    }
  },[pathname, animateActive]);

  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current || !activeScope.current) return;
      const activeEl = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        animateActive(activeScope.current, {
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        }, { duration: 0 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [animateActive]);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 pointer-events-none px-4 md:px-8 flex justify-between items-start gap-2 md:gap-4 max-w-[1400px] mx-auto">
      
      {/* --- ЛЕВАЯ КАПСУЛА --- */}
      <div className="pointer-events-auto h-[56px] shrink-0">
        <LiquidPill className="px-6 flex items-center justify-center">
          <Link href="/" className="flex items-center h-full">
            <Image src="/logo.png" alt="Lol Tech" width={140} height={40} className="object-contain" />
          </Link>
        </LiquidPill>
      </div>

      {/* --- ЦЕНТРАЛЬНАЯ КАПСУЛА --- */}
      <div className="pointer-events-auto flex-1 max-w-fit">
        <LiquidPill className="p-1.5 flex flex-col justify-center min-w-[200px] md:min-w-fit min-h-[56px]">
          
          <nav 
            ref={navRef}
            className="hidden md:flex items-center h-full relative" 
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* АКТИВНЫЙ ПОЛЗУНОК */}
            <motion.div
              ref={activeScope}
              className="absolute top-0 bottom-0 bg-white/[0.08] rounded-full z-[-1]"
              initial={{ opacity: 0 }}
            />

            {/* ПОЛЗУНОК ПРИ НАВЕДЕНИИ */}
            <AnimatePresence>
              {isHovered && hoverStyle && (
                <motion.div
                  className="absolute top-0 bottom-0 bg-white/[0.03] rounded-full z-[-2]"
                  initial={{ opacity: 0 }}
                  animate={{ left: hoverStyle.left, width: hoverStyle.width, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>

            {navItems.map((item) => {
              const isActive = item.path === pathname;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  data-active={isActive}
                  onMouseEnter={(e) => {
                    setHoverStyle({
                      left: e.currentTarget.offsetLeft,
                      width: e.currentTarget.offsetWidth,
                    });
                    setIsHovered(true);
                  }}
                  className={`
                    relative px-6 h-full flex items-center justify-center text-[13px] font-semibold tracking-wider transition-colors duration-300 z-10 uppercase
                    ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Мобильный дропдаун */}
          <div className="md:hidden flex flex-col w-full h-full">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-between w-full px-5 h-[44px] text-[13px] font-semibold text-white uppercase tracking-wider"
            >
              {currentTab.name}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  <div className="flex flex-col gap-1 pb-2 px-2 pt-2 border-t border-white/5 mt-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          px-4 py-3 rounded-xl text-[12px] flex items-center font-semibold uppercase tracking-wider transition-colors
                          ${item.path === pathname ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}
                        `}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </LiquidPill>
      </div>

      {/* --- ПРАВАЯ КАПСУЛА --- */}
      <div className="pointer-events-auto h-[56px] shrink-0">
        <LiquidPill className="px-2 flex items-center justify-center group cursor-pointer hover:bg-white/[0.02]">
          <Link href="/login" className="flex items-center justify-center gap-2 px-4 h-full">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse block"></span>
            <span className="uppercase text-[13px] font-semibold text-gray-200 group-hover:text-white transition-colors">
              Войти
            </span>
          </Link>
        </LiquidPill>
      </div>

    </header>
  );
};