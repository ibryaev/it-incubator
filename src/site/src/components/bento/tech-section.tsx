"use client";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// --- КОНФИГУРАЦИИ АНИМАЦИЙ ---

// Плавный выезд текста
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

// Контейнер для каскадного появления (домино)
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

// "Выпрыгивание" для 3D-платформ
const platformPop = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const
    }
  }
};

export const TechSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-32 px-6">
      
      {/* ЗАГОЛОВОК: Анимация при скролле */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="text-center mb-24 space-y-4"
      >
        <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-medium tracking-tight text-white">
          Разработка IT-продуктов
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Мы создаем современные веб-сайты, удобные интерфейсы и функциональных ботов. 
          Берем на себя весь процесс: от идеи до готового кода под руководством опытных наставников.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* ЛЕВАЯ ЧАСТЬ: Текст (каскадное появление) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="space-y-6 relative z-10"
        >
          <motion.h3 variants={fadeInUp} className="text-3xl md:text-4xl font-medium text-white leading-tight">
            Веб-сервисы и <br /> приложения
          </motion.h3>
          
          <motion.p variants={fadeInUp} className="text-white font-medium text-sm md:text-base mt-2">
            Ускорьте развитие своего бизнеса с <br className="hidden md:block"/> 
            помощью современных технологий
          </motion.p>
          
          <motion.p variants={fadeInUp} className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
            Наша команда готова взять на себя проекты разной сложности. Мы проводим аналитику, 
            рисуем современный UI/UX дизайн, пишем надежный код и тщательно тестируем результат. 
            Вы получаете полностью рабочий продукт, готовый к запуску.
          </motion.p>
          
          <motion.div variants={fadeInUp}>
            <Link href="/contacts">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8"
              >
                Оставить заявку
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ПРАВАЯ ЧАСТЬ: 3D-конструктор из кубов */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } } // Задержка между кубиками
          }}
          className="relative w-full max-w-md mx-auto aspect-square"
        >
          {/* Фоновое свечение всей конструкции */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

          {/* 1. Верхний левый (HTML) */}
          <PlatformNode 
            platformClass="top-[20%] left-[5%] w-[35%]"
            iconSrc="/assets/icon-html.png"
            iconClass="-top-[35%] left-[25%] w-[50%]"
            delay={0}
            zIndex="z-0"
          />

          {/* 2. Верхний правый (Figma) */}
          <PlatformNode 
            platformClass="top-[27%] right-[25%] w-[50%]"
            iconSrc="/assets/icon-figma.png"
            iconClass="-top-[30%] left-[25%] w-[50%]"
            delay={0.8}
            zIndex="z-10"
          />

          {/* 3. Нижний правый (CSS) */}
          <PlatformNode 
            platformClass="top-[52%] right-[7%] w-[35%]"
            iconSrc="/assets/icon-css.png"
            iconClass="-top-[30%] left-[25%] w-[50%]"
            delay={0.4}
            zIndex="z-20"
          />

          {/* 4. Нижний левый (TS) */}
          <PlatformNode 
            platformClass="top-[55%] left-[5%] w-[35%]"
            iconSrc="/assets/icon-ts.png"
            iconClass="-top-[35%] left-[20%] w-[60%]"
            delay={1.2}
            zIndex="z-30"
          />
        </motion.div>
      </div>
    </section>
  );
};

// --- Компонент-помощник для сборки "Платформа + Иконка" ---
interface PlatformNodeProps {
  platformClass: string; 
  iconSrc: string;       
  iconClass: string;     
  delay: number;         
  zIndex: string;        
}

const PlatformNode = ({ platformClass, iconSrc, iconClass, delay, zIndex }: PlatformNodeProps) => {
  return (
    // Внешний motion.div отвечает за эффект появления при скролле (variants)
    <motion.div 
      variants={platformPop}
      className={`absolute aspect-square ${platformClass} ${zIndex}`}
    >
      
      {/* База платформы (куб) */}
      <Image 
        src="/assets/platform.png" 
        alt="platform" 
        fill 
        className="object-contain drop-shadow-xl" 
      />

      {/* Внутренний motion.div отвечает за бесконечное парение (animate) */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay 
        }}
        className={`absolute aspect-square ${iconClass}`}
      >
        <Image 
          src={iconSrc} 
          alt="icon" 
          fill 
          className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" 
        />
      </motion.div>
    </motion.div>
  );
};