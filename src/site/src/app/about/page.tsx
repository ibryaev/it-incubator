"use client";

import { motion } from "framer-motion";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { StatsGrid } from "@/components/bento/stats-grid";
import { TechSection } from "@/components/bento/tech-section";
import { OurStackSection } from "@/components/bento/our-stack";

// 1. Конфигурация анимаций появления
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      <GlowingBackground />
      
      {/* Секция "О нас" */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Текстовый блок с каскадным появлением */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl text-center space-y-6 mt-10 mb-12"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-medium tracking-tight"
          >
            О нас и нашем проекте
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-gray-400 text-sm md:text-base leading-relaxed"
          >
            Мы — студенческая IT-лаборатория, объединяющая талантливых разработчиков, дизайнеров, 
            тестировщиков и аналитиков. Наша миссия — создавать качественные цифровые решения 
            для реального бизнеса, пока мы учимся. Мы работаем как полноценное агентство под 
            строгим руководством опытных преподавателей-наставников. Доверяя нам проект, 
            вы получаете современный продукт и помогаете расти молодым специалистам.
          </motion.p>
        </motion.div>

        {/* Сетка со статистикой (анимации управляются внутри компонента) */}
        <StatsGrid />
      </section>

      {/* Оборачиваем TechSection в анимацию при скролле */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <TechSection />
      </motion.div>

      {/* OurStackSection анимируется внутри себя */}
      <OurStackSection />
      
      <div className="h-32"></div>
    </main>
  );
}