"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider"; // Убедись, что путь к контексту правильный

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants} from "framer-motion";

const fadeInUp: Variants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } 
};
const staggerContainer: Variants = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } 
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async () => {
    setError(""); // Очищаем предыдущие ошибки

    // 1. Проверка на заполненность обязательных полей
    if (!email || !firstName || !password || !confirmPassword) {
      return setError("Пожалуйста, заполните все поля");
    }

    // 2. Проверка формата электронной почты с помощью регулярного выражения
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Введите корректный адрес электронной почты");
    }

    // 3. Проверка совпадения паролей
    if (password !== confirmPassword) {
      return setError("Пароли не совпадают!");
    }

    // 4. Опционально: проверка длины пароля (т.к. бэкенд тоже ругается на короткие)
    if (password.length < 6) {
      return setError("Пароль должен содержать минимум 6 символов");
    }

    try {
      const res = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: null, // Если добавишь поле для фамилии, можно передавать его сюда
          password: password
        }),
      });
      
      const data = await res.json();
      
      // Если бэкенд вернул ошибку
      if (!res.ok) {
        // Достаем ошибку из ответа бэкенда (у вас возвращается {"detail": "..."} или {"error": ["..."]})
        const backendError = data.detail?.[0] || data.detail || data.error?.[0] || "Ошибка регистрации";
        throw new Error(backendError);
      }

      // Если всё успешно, логиним пользователя и перекидываем в кабинет
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
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md space-y-10 relative z-10">
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-medium tracking-tight text-center">
            Регистрация
          </motion.h1>

          <motion.div variants={fadeInUp} className="space-y-4">
            <GlassInput 
              type="email" 
              placeholder="почта" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <GlassInput 
              type="text" 
              placeholder="имя" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
            />
            <GlassInput 
              type="password" 
              placeholder="пароль" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <GlassInput 
              type="password" 
              placeholder="повторите пароль" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
            
            {/* Блок вывода ошибки красным цветом */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-md border border-red-500/20">
                {error}
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-400/30 hover:border-white">
              Войти
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div onClick={handleRegister}>
                <LiquidButton className="px-6 py-3 text-[11px] uppercase tracking-wider cursor-pointer">
                  Зарегистрироваться
                </LiquidButton>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex justify-center pt-4">
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