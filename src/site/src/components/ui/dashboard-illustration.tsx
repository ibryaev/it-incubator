"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export const DashboardIllustration = () => {
  return (
    <div className="relative w-full aspect-[4/3] flex items-center justify-center">
      {/* ВЕРНУЛИ: Твой оригинальный красивый блюр */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 1. СТАТИЧНЫЙ СЛОЙ (Связи и ноды) */}
      <div className="absolute inset-0 z-10 translate-y-32">
        <Image 
          src="/it-incubator/assets/dashboard-mockup.png" 
          alt="Dashboard Connections" 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw" // Подсказка для оптимизатора Next.js
          className="object-contain opacity-80" 
        />
      </div>

      {/* 2. ПАРЯЩИЙ СЛОЙ (Само окно дашборда) */}
      <motion.div
        animate={{ y: [-34, -46, -34] }} 
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ willChange: "transform" }}
        className="absolute inset-0 z-20"
      >
        <Image 
          src="/it-incubator/assets/dashboard-mockup-fly.png" 
          alt="Dashboard UI" 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw" // Подсказка для оптимизатора Next.js
          className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
        />
      </motion.div>
    </div>
  );
};