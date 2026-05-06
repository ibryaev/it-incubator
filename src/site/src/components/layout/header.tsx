"use client";
import Link from "next/link";
import { Button } from "../ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#0B0B0F]/50 backdrop-blur-md border-b border-white/5">
      {/* Логотип */}
      <Link href="/" className="flex items-center gap-2">
        {/* Сюда позже вставим логотипа LolTech */}
        <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Lol<span className="text-white">Tech</span>
        </span>
      </Link>

      {/* Навигация */}
      <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider text-gray-300">
        <Link href="/" className="hover:text-white transition-colors">О нас</Link>
        <Link href="/team" className="hover:text-white transition-colors">Команда</Link>
        <Link href="/contacts" className="hover:text-white transition-colors">Контакты</Link>
      </nav>

      {/* Кнопка входа*/}
      <Link href="/login">
        <Button variant="ghost" className="uppercase text-sm flex gap-2 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          Войти
        </Button>
      </Link>
    </header>
  );
};