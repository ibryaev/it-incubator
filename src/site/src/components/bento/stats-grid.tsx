"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

// Данные из макета
const statsData =[
  { value: "10+", label: "современных фреймворков в нашем стеке", highlighted: false },
  { value: "100%", label: "контроль качества кода и архитектуры от преподавателя", highlighted: true },
  { value: "~25", label: "заряженных студентов в команде", highlighted: false },
  { value: "5+", label: "IT-направлений", highlighted: false },
  { value: "2026", label: "год старта нашего бизнес-инкубатора", highlighted: false },
  { value: "3", label: "основных формата работы (Сайты, Приложения, TG-боты)", highlighted: false },
  { value: "24/7", label: "прямая связь с менеджером проекта в Telegram", highlighted: false },
  { value: "∞", label: "мотивации создавать крутые и работающие IT-продукты", highlighted: false },
];

// Отдельный компонент карточки для отслеживания мыши
const StatCard = ({ stat, index }: { stat: (typeof statsData)[0]; index: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Функция перехватывает координаты курсора внутри карточки
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      // Более плавное и аккуратное появление (easeOut убирает "дерганность")
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      
      onMouseMove={handleMouseMove}
      className={`
        relative group overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center text-center
        ${stat.highlighted 
          ? "bg-gradient-to-br from-blue-500/80 to-blue-700/80 border-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
          : "bg-white/[0.03] border border-white/10 backdrop-blur-sm"
        }
      `}
    >
      {/* Магия динамической подсветки (Spotlight) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${stat.highlighted ? "350px" : "250px"} circle at ${mouseX}px ${mouseY}px,
              ${stat.highlighted ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"},
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Контент (z-10 нужен, чтобы подсветка не перекрывала текст) */}
      <div className="relative z-10">
        <span className={`block text-3xl lg:text-4xl font-semibold mb-2 ${!stat.highlighted && "text-white"}`}>
          {stat.value}
        </span>
        <p className={`text-xs lg:text-sm ${stat.highlighted ? "text-white/90" : "text-gray-400"}`}>
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
};

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto mt-12">
      {statsData.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
};