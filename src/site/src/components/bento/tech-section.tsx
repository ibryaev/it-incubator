"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const TechSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-32 px-6">
      {/* Заголовок */}
      <div className="text-center mb-24 space-y-4">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white">
          Разработка IT-продуктов
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Мы создаем современные веб-сайты, удобные интерфейсы и функциональных ботов. 
          Берем на себя весь процесс: от идеи до готового кода под руководством опытных наставников.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* ЛЕВАЯ ЧАСТЬ: Текст */}
        <div className="space-y-6 relative z-10">
          <h3 className="text-3xl md:text-4xl font-medium text-white leading-tight">
            Веб-сервисы и <br /> приложения
          </h3>
          <p className="text-white font-medium text-sm md:text-base mt-2">
            Ускорьте развитие своего бизнеса с <br className="hidden md:block"/> 
            помощью современных технологий
          </p>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
            Наша команда готова взять на себя проекты разной сложности. Мы проводим аналитику, 
            рисуем современный UI/UX дизайн, пишем надежный код и тщательно тестируем результат. 
            Вы получаете полностью рабочий продукт, готовый к запуску.
          </p>
          
          <button className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8">
            Оставить заявку
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: 3D-конструктор из кубов */}
        <div className="relative w-full max-w-md mx-auto aspect-square">
          {/* Фоновое свечение всей конструкции */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

          {/* 1. Верхний левый (HTML) - Средний план (z-10) */}
          <PlatformNode 
            platformClass="top-[20%] left-[5%] w-[35%]"
            iconSrc="/assets/icon-html.png"
            iconClass="-top-[35%] left-[25%] w-[50%]"
            delay={0}
            zIndex="z-0"
          />

          {/* 2. Верхний правый (Figma) - Дальний план (z-0) */}
          <PlatformNode 
            platformClass="top-[27%] right-[25%] w-[50%]"
            iconSrc="/assets/icon-figma.png"
            iconClass="-top-[30%] left-[25%] w-[50%]"
            delay={0.8}
            zIndex="z-10"
          />

          {/* 3. Нижний правый (CSS) - Ближний план (z-20) */}
          <PlatformNode 
            platformClass="top-[52%] right-[7%] w-[35%]"
            iconSrc="/assets/icon-css.png"
            iconClass="-top-[30%] left-[25%] w-[50%]"
            delay={0.4}
            zIndex="z-20"
          />

          {/* 4. Нижний левый (TS) - Самый передний план (z-30) */}
          <PlatformNode 
            platformClass="top-[55%] left-[5%] w-[35%]"
            iconSrc="/assets/icon-ts.png"
            iconClass="-top-[35%] left-[20%] w-[60%]"
            delay={1.2}
            zIndex="z-30"
          />
        </div>
      </div>
    </section>
  );
};

// --- Компонент-помощник для сборки "Платформа + Иконка" ---
interface PlatformNodeProps {
  platformClass: string; // Позиция платформы в контейнере
  iconSrc: string;       // Путь к иконке
  iconClass: string;     // Позиция иконки ОТНОСИТЕЛЬНО платформы
  delay: number;         // Задержка анимации парения
  zIndex: string;        // Слой (кто кого перекрывает)
}

const PlatformNode = ({ platformClass, iconSrc, iconClass, delay, zIndex }: PlatformNodeProps) => {
  return (
    <div className={`absolute aspect-square ${platformClass} ${zIndex}`}>
      
      {/* База платформы (куб) */}
      <Image 
        src="/assets/platform.png" 
        alt="platform" 
        fill 
        className="object-contain drop-shadow-xl" 
      />

      {/* Парящая иконка */}
      <motion.div
        animate={{ y:[0, -12, 0] }}
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
    </div>
  );
};