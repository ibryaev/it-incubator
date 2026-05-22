"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, Variants} from "framer-motion";

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

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async () => {
    setError("");
    if (password !== confirmPassword) {
      return setError("Пароли не совпадают");
    }

    try {
      const res = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: null,
          password
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.[0] || data.detail || "Ошибка регистрации");

      // Успешно зарегались, сразу логиним
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
            <GlassInput type="email" placeholder="почта" value={email} onChange={e => setEmail(e.target.value)} />
            <GlassInput type="text" placeholder="имя" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <GlassInput type="password" placeholder="пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <GlassInput type="password" placeholder="повторите пароль" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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

          {/* Ссылка назад */}
          <motion.div variants={fadeInUp} className="flex justify-center pt-4">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
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