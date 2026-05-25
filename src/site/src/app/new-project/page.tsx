"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const fadeInUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } };
const staggerContainer: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async () => {
    setError("");
    if (!title.trim() || !description.trim()) {
      return setError("Название и краткое описание обязательны");
    }
    if (!user.passwordRaw) {
      return setError("Сессия устарела. Перезайдите в аккаунт.");
    }

    setIsLoading(true);

    // Склеиваем ТЗ
    const techspec = `Тип продукта: ${productType || "Не указан"}\nОриентировочный бюджет/сроки: ${budget || "Не указаны"}\n\nОписание задачи:\n${description}`;

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FastAPI ожидает именно такую структуру из двух моделей:
        body: JSON.stringify({
          customer: {
            email: user.email,
            password: user.passwordRaw
          },
          created_order: {
            title: title.trim(),
            techspec: techspec
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        let backendError = "Ошибка сервера";
        if (data.detail) {
          if (typeof data.detail === "string") backendError = data.detail;
          else if (Array.isArray(data.detail)) backendError = typeof data.detail[0] === "string" ? data.detail[0] : data.detail[0]?.msg || "Ошибка валидации";
        } else if (data.error) {
          backendError = typeof data.error === "string" ? data.error : data.error[0];
        }
        throw new Error(backendError);
      }

      // Заказ успешно создан! Теперь скачаем свежие данные юзера (в них появится новый ID в orders_created)
      const userRes = await fetch(`/api/users/read/${user.id}`);
      if (userRes.ok) {
        const updatedUser = await userRes.json();
        // Сохраняем пароль, так как read его не возвращает
        login({ ...updatedUser, passwordRaw: user.passwordRaw });
      }

      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
            <GlassInput type="text" placeholder="Название проекта (обязательно)" value={title} onChange={e => setTitle(e.target.value)} />
            <GlassInput type="text" placeholder="Тип продукта (Сайт, Приложение, Telegram-бот)" value={productType} onChange={e => setProductType(e.target.value)} />
            <GlassInput type="text" placeholder="Ориентировочный бюджет или сроки (опционально)" value={budget} onChange={e => setBudget(e.target.value)} />
            
            <textarea 
              placeholder="Краткое описание задачи... (обязательно)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] backdrop-blur-md transition-all duration-300 resize-none h-32"
            />
            {error && <p className="text-red-400 text-[11px] italic text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white order-2 sm:order-1">
              Отмена
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto order-1 sm:order-2">
              <button onClick={handleSubmit} disabled={isLoading} className="w-full disabled:opacity-50 outline-none">
                <LiquidButton className="w-full px-8 py-3 text-[11px] uppercase tracking-wider">
                  {isLoading ? "Отправка..." : "Отправить заявку"}
                </LiquidButton>
              </button>
            </motion.div>
          </motion.div>

        </motion.div>
      </section>
    </main>
  );
}