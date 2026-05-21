"use client";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

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

export default function NewProjectPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-lg space-y-10 relative z-10" // Сделал max-w-lg (чуть шире), так как это форма заявки
        >
          {/* Заголовок */}
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
              Новая заявка
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Опишите вашу идею, и мы свяжемся с вами для обсуждения деталей.
            </p>
          </motion.div>

          {/* Список инпутов */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <GlassInput type="text" placeholder="Название проекта (например, 'Бот для магазина')" />
            <GlassInput type="text" placeholder="Тип продукта (Сайт, Приложение, Telegram-бот)" />
            <GlassInput type="text" placeholder="Ориентировочный бюджет или сроки (опционально)" />
            
            {/* Большое поле для текста, стилизованное под GlassInput */}
            <textarea 
              placeholder="Краткое описание задачи..."
              className="w-full px-6 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] backdrop-blur-md transition-all duration-300 resize-none h-32"
            />
          </motion.div>

          {/* Действия */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <Link 
              href="/dashboard" 
              className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white order-2 sm:order-1"
            >
              Отмена
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto order-1 sm:order-2">
              <LiquidButton className="w-full px-8 py-3 text-[11px] uppercase tracking-wider">
                Отправить заявку
              </LiquidButton>
            </motion.div>
          </motion.div>

          {/* Ссылка назад в кабинет */}
          <motion.div variants={fadeInUp} className="flex justify-center pt-8">
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm border-b border-gray-400/30 group-hover:border-white/30">
                Вернуться в личный кабинет
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}