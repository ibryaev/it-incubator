"use client";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants} from "framer-motion";

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
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          {/* Заголовок */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-medium tracking-tight text-center"
          >
            Регистрация
          </motion.h1>

          {/* Список инпутов - каждый появится по очереди */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <GlassInput type="email" placeholder="почта" />
            <GlassInput type="text" placeholder="имя" />
            <GlassInput type="password" placeholder="пароль" />
            <GlassInput type="password" placeholder="повторите пароль" />
          </motion.div>

          {/* Действия */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center justify-between gap-4"
          >
            <Link 
              href="/login" 
              className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white"
            >
              Войти
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LiquidButton className="px-6 py-3 text-[11px] uppercase tracking-wider">
                Зарегистрироваться
              </LiquidButton>
            </motion.div>
          </motion.div>

          {/* Ссылка назад */}
          <motion.div variants={fadeInUp} className="flex justify-center pt-4">
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