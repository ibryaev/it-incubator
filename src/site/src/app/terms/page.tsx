"use client";

import { Header } from "@/components/layout/header";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// Конфигурация анимаций
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] as const 
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-2xl text-center space-y-8 relative z-10"
        >
          {/* Главный заголовок */}
          <motion.h1 
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-medium tracking-tight"
          >
            Скоро...
          </motion.h1>

          {/* Описание */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-400 tracking-wide font-medium"
          >
            Здесь появится политика конфиденциальности <br className="hidden md:block"/> 
            и пользовательское соглашение.
          </motion.p>

          {/* Декоративная линия */}
          <motion.div 
            variants={fadeInUp}
            className="w-24 h-[1px] bg-white/20 mx-auto my-8"
          />

          {/* Ссылка назад */}
          <motion.div variants={fadeInUp} className="flex justify-center pt-8">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm border-b border-gray-400/30 group-hover:border-white/30">
                Вернуться на главную
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}