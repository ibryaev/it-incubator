import { Header } from "@/components/layout/header";
import { GlowingBackground } from "@/components/ui/glowing-bg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { DashboardIllustration } from "@/components/ui/dashboard-illustration";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      <GlowingBackground />
      <Header />
      
      {/* 1. HERO СЕКЦИЯ */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto mt-10">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6">
          IT-инкубатор
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-2xl">
          Разрабатываем сайты, веб-приложения и ботов для ваших задач. Свежий взгляд, 
          современные технологии и контроль качества под руководством опытных наставников.
        </p>
      </section>
    </main>
  );
}