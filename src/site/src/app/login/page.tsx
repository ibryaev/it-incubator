"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider"; // Проверь правильность пути, если контекст лежит в другом месте

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// Анимации
const fadeInUp: Variants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } 
};
const staggerContainer = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } 
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(""); // Очищаем предыдущую ошибку
    
    if (!email || !password) {
      return setError("Пожалуйста, введите почту и пароль");
    }

    try {
      const res = await fetch("https://subbota.tech/api/users/login", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        let backendError = "Ошибка сервера";
        
        if (data.detail) {
          // Если detail - это строка (например "Not Found" или "Неверный логин"), берем её целиком
          if (typeof data.detail === "string") {
            backendError = data.detail;
          } 
          // Если detail - это массив (ошибки валидации Pydantic от FastAPI)
          else if (Array.isArray(data.detail)) {
            backendError = data.detail[0]?.msg || "Ошибка валидации";
          }
        } else if (data.error) {
          // Твои кастомные ошибки из словарей бэкенда
          backendError = typeof data.error === "string" ? data.error : data.error[0];
        }

        throw new Error(backendError);
      }

      // Сохраняем пользователя в контекст
      login({ ...data, passwordRaw: password });
      router.push("/dashboard");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md space-y-12 relative z-10">
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl font-medium tracking-tight text-center">
            Вход
          </motion.h1>

          <motion.div variants={fadeInUp} className="space-y-4">
            <GlassInput 
              type="email" 
              placeholder="почта" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <GlassInput 
              type="password" 
              placeholder="пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            
            {/* Блок вывода ошибки красным цветом (как в регистрации) */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-md border border-red-500/20">
                {error}
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
            <Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white">
              Зарегистрироваться
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div onClick={handleLogin}>
                <LiquidButton className="px-10 cursor-pointer">
                  ВОЙТИ
                </LiquidButton>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex justify-center pt-8">
            <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm border-b border-gray-400/30 group-hover:border-white/30">
                Вернуться на главную
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}