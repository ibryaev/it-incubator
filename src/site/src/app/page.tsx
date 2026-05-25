"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { DashboardIllustration } from "@/components/ui/dashboard-illustration";
import dynamic from "next/dynamic";

// Динамически подгружаем 3D-компонент, полностью отключая серверный рендеринг (SSR)
const SilverRubiksCube = dynamic(
  () => import("@/components/ui/silver-rubiks-cube").then((mod) => mod.SilverRubiksCube),
  { ssr: false }
);

// ─── Анимации ─────────────────────────────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const 
    }
  }
};

// ─── Анимированные круги-волны из центра (Оптимизированные) ─────────────────
const RIPPLE_COUNT = 8;
const RIPPLE_DURATION = 8.0; 
const RIPPLE_MAX_SIZE = 2000; 

function RippleRing({ index }: { index: number }) {
  const delay = index * (RIPPLE_DURATION / RIPPLE_COUNT);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: RIPPLE_MAX_SIZE,
        height: RIPPLE_MAX_SIZE,
        borderRadius: "50%",
        // Сделали круги чуть-чуть потолще (5px вместо 3px) и чуть ярче
        border: "5px solid rgba(185, 171, 255, 0.6)", 
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        willChange: "transform, opacity",
      }}
      initial={{ scale: 0, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{
        ease: "linear",
        duration: RIPPLE_DURATION,
        delay,
        repeat: Infinity,
        repeatDelay: 0,
      }}
    />
  );
}

function RippleCircles() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, overflow: "hidden" }}
    >
      {/* Возвращаем оригинальные блюры для центральных свечений */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(56,189,248,0.14) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.42) 0%, rgba(99,102,241,0.18) 50%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 290, height: 290, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(210,200,255,0.65) 0%, rgba(160,130,255,0.30) 10%, transparent 100%)",
          filter: "blur(32px)",
        }}
      />

      {/* Кольца */}
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <RippleRing key={i} index={i} />
      ))}
    </div>
  );
}

// ─── Пятно привязанное к секции (Оригинальное с blur) ───────────────────────
function SectionGlow({
  color, size = 400, top, left, opacity = 1,
}: {
  color: string; size?: number; top?: string | number;
  left?: string | number; opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top, left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: `blur(${size * 0.35}px)`,
        opacity,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        zIndex: 0,
      }}
    />
  );
}

// ─── Страница ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      
      {/* ── 1. HERO — на весь экран ───────────────────────────────────────── */}
      <section
        className="relative w-full"
        style={{ height: "100dvh", zIndex: 1 }}
      >
        <RippleCircles />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <div className="pointer-events-auto flex flex-col items-center justify-center -mt-2">
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-medium tracking-tight text-white drop-shadow-1xl">
              IT-инкубатор
            </motion.h1>

            <motion.div variants={fadeInUp} className="mt-8 mb-4 md:mt-12 md:mb-6">
              <SilverRubiksCube />
            </motion.div>

            <motion.p variants={fadeInUp} className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl drop-shadow-md mx-auto">
              Разрабатываем сайты, веб-приложения и ботов для ваших задач. Свежий взгляд,
              современные технологии и контроль качества под руководством опытных наставников.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "80%", zIndex: 5 }}
        >
          <Link href="/contacts">
            <LiquidButton className="mt-4 px-10 py-4">
              Обсудить проект
            </LiquidButton>
          </Link>
        </motion.div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(10,10,15,0.7) 60%, #0a0a0f 100%)",
            zIndex: 3, pointerEvents: "none",
          }}
        />
      </section>

      {/* ── 2. АВТОМАТИЗАЦИЯ ─────────────────────────────────────────────── */}
      <section
        className="relative w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        style={{ zIndex: 1 }}
      >
        <SectionGlow color="rgba(99,102,241,0.20)" size={450} top="50%" left="25%" />
        <SectionGlow color="rgba(34,211,238,0.10)" size={300} top="30%" left="75%" opacity={0.6} />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={imageReveal} className="relative z-10">
          <DashboardIllustration />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="space-y-6 relative z-10">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-medium text-white leading-tight">
            Автоматизация <br /> бизнес-процессов
          </motion.h2>
          <motion.h3 variants={fadeInUp} className="text-white font-medium text-sm md:text-base">
            Разрабатываем удобные дашборды, системы <br className="hidden md:block" />
            учета и интегрируем Telegram-ботов
          </motion.h3>
          <motion.p variants={fadeInUp} className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
            Мы создаем не просто красивые страницы, а рабочие инструменты для вашего бизнеса.
            От личных кабинетов пользователей до сложных административных панелей.
          </motion.p>
          <Link href="/contacts">
            <motion.button variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8">
              Обсудить задачу
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── 3. ГОТОВЫ НАЧАТЬ ПРОЕКТ? ─────────────────────────────────────── */}
      <section
        className="relative w-full max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-start"
        style={{ zIndex: 1 }}
      >
        <SectionGlow color="rgba(34,211,238,0.18)" size={500} top="50%" left="20%" />
        <SectionGlow color="rgba(56,189,248,0.10)" size={280} top="70%" left="70%" opacity={0.5} />

        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight">
            Готов <br />
            начать проект?
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6 text-sm md:text-base text-gray-300 leading-relaxed relative z-10">
          <motion.p variants={fadeInUp}>
            Приглашаем вас к сотрудничеству! Мы всегда открыты для новых вызовов и готовы взяться
            за разработку вашего продукта.
          </motion.p>
          <motion.p variants={fadeInUp}>
            Работая с нашим бизнес-инкубатором, вы вносите огромный вклад в развитие молодых талантов.
          </motion.p>
          <Link href="/new-project">
            <motion.button variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8 pt-4">
              Перейти к созданию заявки
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── 4. PRE-FOOTER CTA ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-4xl mx-auto px-6 py-32 text-center flex flex-col items-center"
        style={{ zIndex: 1 }}
      >
        <SectionGlow color="rgba(56,189,248,0.14)" size={380} top="50%" left="-5%" />
        <SectionGlow color="rgba(139,92,246,0.14)" size={380} top="50%" left="105%" />

        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 relative z-10">
          Остались вопросы?
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-2xl relative z-10">
          Мы всегда открыты для новых идей. Если вам нужен сайт, приложение или есть классная
          задумка — давайте обсудим это!
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
          <Link href="/contacts">
            <LiquidButton className="mt-4 px-10 py-4">
              Оставить заявку
            </LiquidButton>
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}