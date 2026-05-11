"use client";

import { motion } from "framer-motion";
import Link from "next/link"; // Импортируем Link для навигации
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { ArrowRight } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { DashboardIllustration } from "@/components/ui/dashboard-illustration";

// Конфигурация анимаций появления
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const imageReveal = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      <GlowingBackground />
      
      {/* 1. HERO СЕКЦИЯ */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto mt-10"
      >
        <motion.h1 
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6"
        >
          IT-инкубатор
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-2xl"
        >
          Разрабатываем сайты, веб-приложения и ботов для ваших задач. Свежий взгляд, 
          современные технологии и контроль качества под руководством опытных наставников.
        </motion.p>
        
        {/* Кнопка 1: Анимация как у нижней (1.05) */}
        <motion.div 
          variants={fadeInUp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/contacts">
            <LiquidButton className="mt-8 px-10 py-4">
              Обсудить проект
            </LiquidButton>
          </Link>
        </motion.div>
      </motion.section>

      {/* 2. АВТОМАТИЗАЦИЯ */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={imageReveal}
        >
          <DashboardIllustration />
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="space-y-6 relative z-10"
        >
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
          
          {/* Кнопка 2: Анимация как у соседней секции (1.02) */}
          <Link href="/contacts">
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8"
            >
              Обсудить задачу
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* 3. ГОТОВЫ НАЧАТЬ ПРОЕКТ? */}
      <section className="w-full max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -left-20 top-0 w-64 h-64 bg-cyan-500/20 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight relative z-10">
            Готов <br />
            начать проект?
          </h2>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-6 text-sm md:text-base text-gray-300 leading-relaxed relative z-10"
        >
          <motion.p variants={fadeInUp}>
            Приглашаем вас к сотрудничеству! Мы всегда открыты для новых вызовов и готовы взяться 
            за разработку вашего продукта.
          </motion.p>
          <motion.p variants={fadeInUp}>
            Работая с нашим бизнес-инкубатором, вы вносите огромный вклад в развитие молодых талантов.
          </motion.p>
          
          {/* Кнопка 3: Микро-скейл (1.02) */}
          <Link href="/contacts">
            <motion.button 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8 pt-4"
            >
              Перейти к созданию заявки
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* 4. PRE-FOOTER CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-4xl mx-auto px-6 py-32 text-center flex flex-col items-center"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[120px] pointer-events-none" />

        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 relative z-10">
          Остались вопросы?
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-2xl relative z-10">
          Мы всегда открыты для новых идей. Если вам нужен сайт, приложение или есть классная 
          задумка — давайте обсудим это!
        </p>
        
        {/* Кнопка 4: Заметный скейл (1.05) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/contacts">
            <LiquidButton className="relative z-10 mt-4 px-10 py-4">
              Оставить заявку
            </LiquidButton>
          </Link>
        </motion.div>
      </motion.section>

    </main>
  );
}