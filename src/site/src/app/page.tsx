import { Header } from "@/components/layout/header";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { DashboardIllustration } from "@/components/ui/dashboard-illustration";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      <GlowingBackground />
      
      {/* 1. HERO СЕКЦИЯ */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto mt-10">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6">
          IT-инкубатор
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-2xl">
          Разрабатываем сайты, веб-приложения и ботов для ваших задач. Свежий взгляд, 
          современные технологии и контроль качества под руководством опытных наставников.
        </p>
        <LiquidButton className="mt-8 px-10 py-4">
          Обсудить проект
        </LiquidButton>
      </section>

      {/* 2. АВТОМАТИЗАЦИЯ БИЗНЕС-ПРОЦЕССОВ */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* 3D-Иллюстрация Дашборда */}
        <DashboardIllustration />

        {/* Текст */}
        <div className="space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-medium text-white leading-tight">
            Автоматизация <br /> бизнес-процессов
          </h2>
          <h3 className="text-white font-medium text-sm md:text-base">
            Разрабатываем удобные дашборды, системы <br className="hidden md:block" />
            учета и интегрируем Telegram-ботов
          </h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
            Мы создаем не просто красивые страницы, а рабочие инструменты для вашего бизнеса. 
            От личных кабинетов пользователей до сложных административных панелей.
          </p>
          
          <button className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8">
            Обсудить задачу
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* 3. ГОТОВЫ НАЧАТЬ ПРОЕКТ? */}
      <section className="w-full max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        
        {/* Заголовок с мощным свечением */}
        <div className="relative">
          <div className="absolute -left-20 top-0 w-64 h-64 bg-cyan-500/20 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight relative z-10">
            Готовы <br />
            начать проект?
          </h2>
        </div>

        {/* Текст справа */}
        <div className="space-y-6 text-sm md:text-base text-gray-300 leading-relaxed relative z-10">
          <p>
            Приглашаем вас к сотрудничеству! Мы всегда открыты для новых вызовов и готовы взяться 
            за разработку вашего продукта: будь то стильный сайт, удобное мобильное приложение 
            или Telegram-бот для бизнеса.
          </p>
          <p>
            Работая с нашим бизнес-инкубатором, вы получаете не только современное и качественное 
            IT-решение. Вы вносите огромный вклад в развитие молодых талантов.
          </p>
          
          <button className="group flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-8 pt-4">
            Перейти к созданию заявки
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* 4. ОСТАЛИСЬ ВОПРОСЫ (Pre-footer CTA) */}
      <section className="relative w-full max-w-4xl mx-auto px-6 py-32 text-center flex flex-col items-center">
        {/* Декоративные свечения по бокам */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[120px] pointer-events-none" />

        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 relative z-10">
          Остались вопросы?
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-2xl relative z-10">
          Мы всегда открыты для новых идей и нестандартных задач. Если вам нужен сайт для бизнеса, 
          приложение или просто есть классная задумка, которую не терпится реализовать — давайте 
          обсудим это! Зарегистрируйтесь на платформе, чтобы создать заказ, или напишите нашему 
          менеджеру для консультации.
        </p>
        
        <LiquidButton className="relative z-10 mt-4 px-10 py-4">
          Оставить заявку
        </LiquidButton>
      </section>

    </main>
  );
}