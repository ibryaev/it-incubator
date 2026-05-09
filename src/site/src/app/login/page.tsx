import { Header } from "@/components/layout/header";
import { GlowingBackground } from "@/components/ui/glowing-bg";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <GlowingBackground />
      <Header />
      
      {/* Временный контент для теста */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <h1 className="text-6xl font-bold text-white text-center tracking-tighter">
          Вход <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Lol Tech
          </span>
        </h1>
      </div>
    </main>
  );
}