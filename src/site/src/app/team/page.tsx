"use client";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { motion, Variants} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const teamMembers =[
  {
    surname: "ИВАНОВ",
    name: "Иван Иваныч",
    title: "Главный по тарелочкам (Cloud Lead)",
    achievements:[
      "Разработал алгоритм обхода здравого смысла",
      "Senior Tomato Grower в свободное время",
      "Умеет выходить из VIM без гугла"
    ],
    image: "/assets/team/ivan.png",
  },
  {
    surname: "ПЕТРОВ",
    name: "Пётр Петрович",
    title: "Cyber-Butler & GPT Whisperer",
    achievements:[
      "Научил нейросеть сопереживать дедлайнам",
      "Мастер рекурсивного заваривания кофе",
      "Ex-NASA Pixel Shifter"
    ],
    image: "/assets/team/petrov.png",
  },
  {
    surname: "СЕМЁНОВ",
    name: "Семён Семёныч",
    title: "Министр мемов и HR-оптимизма",
    achievements:[
      "Создатель UNIX (на самом деле нет)",
      "Main-тестировщик интернета на наличие котиков",
      "Founder of 'Vibe-First' Development"
    ],
    image: "/assets/team/semenov.png",
  },
];

// --- Конфигурация анимаций ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: "easeOut" as const
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

export default function TeamPage() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col">
      <GlowingBackground />

      <section className="flex-1 flex flex-col items-center px-6 pt-40 pb-20">
        
        {/* Анимированный заголовок */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-medium tracking-tight mb-20 text-center uppercase"
        >
          Наша команда <br />
        </motion.h1>

        {/* Сетка команды: управляет каскадным появлением дочерних элементов */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl w-full"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={fadeInUp} // Получает команду на появление от staggerContainer
              whileHover={{ y: -8 }} // Легкое приподнятие всей карточки при наведении
              className="flex flex-col items-center text-center group"
            >
              {/* Рамка фото как на макете */}
              <div className="relative w-full aspect-[4/5] max-w-[320px] mb-8 overflow-hidden rounded-xl border-[3px] border-[#A38D5B] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                {/* Эффект стекла поверх фото */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Текст (Фамилия жирно, имя ниже) */}
              <div className="space-y-1 mb-4">
                <h2 className="text-3xl font-bold tracking-tighter leading-none uppercase">
                  {member.surname}
                </h2>
                <h3 className="text-xl font-medium text-blue-400 tracking-tight">
                  {member.name}
                </h3>
              </div>

              {/* Должность и ачивки */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-100 uppercase tracking-widest">
                  {member.title}
                </p>
                <div className="flex flex-col text-sm text-gray-400 space-y-1 italic">
                  {member.achievements.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Ссылка возврата плавно появляется после загрузки сетки */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link 
            href="/" 
            className="group mt-24 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm border-b border-gray-400/30 group-hover:border-white/30">
              Вернуться на главную
            </span>
          </Link>
        </motion.div>

      </section>
    </main>
  );
}