"use client"; // Добавили чтобы использовать хук

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/auth-provider"; // Подключаем контекст

export const Footer = () => {
  const { user } = useAuth(); // Получаем юзера

  return (
    <footer className="w-full border-t border-white/10 bg-[#0B0B0F]/80 backdrop-blur-lg mt-auto relative z-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-16 pb-8">
        <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-12 md:gap-10">
          
          <div className="flex flex-col space-y-6">
            <h3 className="text-white text-[13px] font-bold tracking-widest uppercase opacity-90">
              Lol Tech
            </h3>
            <nav className="flex flex-col space-y-4">
              <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300">
                О проекте
              </Link>
              {/* Динамическая ссылка в зависимости от авторизации */}
              <Link 
                href={user ? "/dashboard" : "/login"} 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
              >
                Личный кабинет
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0">
            <Link href="/" className="inline-block opacity-80 hover:opacity-100 transition-opacity duration-300">
              <Image src="/logo.png" alt="Lol Tech" width={140} height={40} className="object-contain" />
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/terms" className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors duration-300">
            Пользовательское соглашение
          </Link>
          <p className="text-[13px] text-gray-500 text-center md:text-right">
            © 2026 Студенческий бизнес-инкубатор. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};