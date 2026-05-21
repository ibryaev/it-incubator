"use client";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Конфигурация анимаций ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Задержка появления между строками контактов
      delayChildren: 0.1
    }
  }
};

export default function ContactsPage() {
  const contactData =[
    {
      title: "Телеграм",
      value: "@loltipatibot",
      buttonText: "ПЕРЕЙТИ",
      link: "https://t.me/loltipatibot",
    },
    {
      title: "Электронная почта",
      value: "blablablaloltech@gmail.com",
      buttonText: "НАПИСАТЬ",
      link: "mailto:blablablaloltech@gmail.com",
    },
    {
      title: "Телефон",
      value: "+7 (999) 999-99-99",
      buttonText: "ПОЗВОНИТЬ",
      link: "tel:+79999999999",
    },
  ];

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      {/* Оборачиваем всю секцию в родительский motion.div для каскадного появления */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20"
      >
        {/* Заголовок страницы */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-6xl font-medium tracking-tight mb-16 text-center"
        >
          Наши контакты
        </motion.h1>

        {/* Список контактов */}
        <div className="w-full max-w-2xl space-y-10">
          {contactData.map((contact, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp} // Каждая строка слушает родителя и появляется по очереди
              className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 group"
            >
              {/* Текстовая часть */}
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold transition-colors group-hover:text-blue-400">
                  {contact.title}
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  {contact.value}
                </p>
              </div>

              {/* Кнопка с жидким стеклом (добавили hover/tap эффекты) */}
              <div className="shrink-0 w-full md:w-auto">
                <a href={contact.link} className="block w-full">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LiquidButton className="w-full md:min-w-[180px] py-3 text-[13px]">
                      {contact.buttonText}
                    </LiquidButton>
                  </motion.div>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ссылка возврата на главную */}
        <motion.div variants={fadeInUp} className="mt-20">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm md:text-base border-b border-gray-400/30 group-hover:border-white/30">
              Вернуться на главную
            </span>
          </Link>
        </motion.div>

      </motion.section>
    </main>
  );
}