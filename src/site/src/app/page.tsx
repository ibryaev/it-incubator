import { Header } from "@/components/layout/header";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { StatsGrid } from "@/components/bento/stats-grid";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      <GlowingBackground />
      <Header />
      
      {/* Секция "О нас" */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Текстовый блок */}
        <div className="max-w-3xl text-center space-y-6 mt-10">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            О нас и нашем проекте
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Мы — студенческая IT-лаборатория, объединяющая талантливых разработчиков, дизайнеров, 
            тестировщиков и аналитиков. Наша миссия — создавать качественные цифровые решения 
            для реального бизнеса, пока мы учимся. Мы работаем как полноценное агентство под 
            строгим руководством опытных преподавателей-наставников. Доверяя нам проект, 
            вы получаете современный продукт и помогаете расти молодым специалистам.
          </p>
        </div>

        {/* Сетка со статистикой */}
        <StatsGrid />
        
      </section>
    </main>
  );
}