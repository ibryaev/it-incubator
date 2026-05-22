"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

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
  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    // Формируем techspec согласно твоим требованиям
    const techspec = `Описание:\nТип продукта: ${productType || "Не указан"}\nОриентировочный бюджет и сроки: ${budget || "Не указаны"}\nКраткое описание: ${description || "Не указано"}`;

    const payload = {
      title,
      techspec,
      customer_id: user?.id,
    };

    console.log("Готово к отправке на сервер:", payload);

    // TODO: Здесь будет запрос к бэкенду, когда напишешь эндпоинт POST /orders/create
    // await fetch("http://localhost:8000/orders/create", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload)
    // });

    alert("Заявка успешно сформирована! (Пока мок, см. console.log)");
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-20">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-lg space-y-10 relative z-10">
          
          <motion.div variants={fadeInUp} className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Новая заявка</h1>
            <p className="text-gray-400 text-sm md:text-base">Опишите вашу идею, и мы свяжемся с вами для обсуждения деталей.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-4">
            <GlassInput type="text" placeholder="Название проекта" value={title} onChange={e => setTitle(e.target.value)} />
            <GlassInput type="text" placeholder="Тип продукта (Сайт, Приложение, Telegram-бот)" value={productType} onChange={e => setProductType(e.target.value)} />
            <GlassInput type="text" placeholder="Ориентировочный бюджет или сроки" value={budget} onChange={e => setBudget(e.target.value)} />
            
            <textarea 
              placeholder="Краткое описание задачи..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] backdrop-blur-md transition-all duration-300 resize-none h-32"
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white order-2 sm:order-1">
              Отмена
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto order-1 sm:order-2">
              <div onClick={handleSubmit}>
                <LiquidButton className="w-full px-8 py-3 text-[11px] uppercase tracking-wider cursor-pointer">
                  Отправить заявку
                </LiquidButton>
              </div>
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