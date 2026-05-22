"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

// --- МОКОВЫЕ ДАННЫЕ ---
const userData = {
  login: "Анатолий",
  email: "anatoliy@gmail.com",
  password: "********",
  status: "пользователь",
};

const projectsData =[
  {
    id: 1,
    title: "Сайт дачного поселка",
    description:
      "Официальный сайт дачного поселка Зеленые Дачи. Вся информация о свободных участках, ценах, инфраструктуре и правилах покупки.",
    status: "В разработке",
    statusColor: "text-yellow-500",
    image: "/it-incubator/assets/project-placeholder-1.png",
  },
  {
    id: 2,
    title: "Парсер СМИ",
    description:
      "Официальный информационный ресурс дачного поселка Зеленые Дачи. Публикация нормативной документации, отчетов о благоустройстве и новостей для жителей.",
    status: "Готов",
    statusColor: "text-green-500",
    image: "/it-incubator/assets/project-placeholder-2.png",
  },
  
  {
    id: 3,
    title: "Telegram-бот для заявок",
    description:
      "Бот для автоматического сбора заявок от клиентов, интеграции с CRM-системой и умного распределения задач между менеджерами.",
    status: "Готов",
    statusColor: "text-green-500",
    image: "/it-incubator/assets/project-placeholder-3.png",
  },
  {
    id: 4,
    title: "Внутренний дашборд",
    description:
      "Админ-панель для мониторинга активности пользователей, сбора статистики и управления доступом сотрудников.",
    status: "В разработке",
    statusColor: "text-yellow-500",
    image: "/it-incubator/assets/project-placeholder-4.png",
  },
];

// --- АНИМАЦИИ ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

// СЛОВАРЬ ПЕРЕВОДОВ:
const roleTranslations: Record<string, string> = {
  customer: "заказчик",
  student: "студент",
  manager: "менеджер",
  admin: "администратор",
};

export default function DashboardPage() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const displayedProjects = showAllProjects ? projectsData : projectsData.slice(0, 2);

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col pb-20">
      <GlowingBackground />

      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32"
      >
        {/* ЗАГОЛОВОК */}
        <motion.h1
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-medium text-center mb-16 tracking-tight"
        >
          Личный кабинет
        </motion.h1>

        {/* БЛОК ПРОФИЛЯ */}
        <motion.div variants={fadeInUp} className="w-full flex flex-col md:flex-row items-center justify-start gap-12 md:gap-24 lg:gap-32 mb-32 relative">
          
          <button onClick={logout} className="absolute top-0 right-0 text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors">
            <LogOut size={18} /> Выйти
          </button>

          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#1A1A1E] flex items-center justify-center border border-white/5 shadow-2xl">
            <User className="w-24 h-24 md:w-28 md:h-28 text-[#2A2A30]" strokeWidth={1.5} />
          </div>

          <div className="w-full max-w-md space-y-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">имя</p>
              <h2 className="text-3xl font-semibold">{user.first_name} {user.last_name || ""}</h2>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">почта</p>
              <div className="bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-md w-full">
                <span className="font-medium text-gray-200">{user.email}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">статус</p>
              <div className="bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-md w-full">
                <span className="font-medium text-gray-200 capitalize">
                  {roleTranslations[user.role] || user.role}
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* БЛОК ПРОЕКТОВ */}
        <motion.div variants={fadeInUp} className="w-full">
          {/* Заголовок и кнопка */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Мои проекты
            </h2>
            <Link href="/new-project">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LiquidButton className="px-8 py-3 text-sm font-semibold uppercase tracking-wider">
                  Новая заявка
                </LiquidButton>
              </motion.div>
            </Link>
          </div>

          {/* Список карточек проектов с анимацией добавления/удаления */}
          <motion.div layout className="space-y-6 w-full">
            <AnimatePresence>
              {displayedProjects.map((project) => (
                <motion.div
                  layout // Позволяет другим карточкам плавно раздвигаться
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4 }}
                  className="group relative flex flex-col md:flex-row bg-[#131316] border border-white/5 rounded-2xl overflow-hidden hover:bg-[#18181b] transition-colors duration-300"
                >
                  {/* Текстовая часть карточки */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                    <div className="space-y-4 mb-8">
                      <h3 className="text-2xl md:text-3xl font-medium text-white">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
                        {project.description}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Скриншот (справа) */}
                  <div className="relative w-full md:w-5/12 min-h-[250px] md:min-h-full border-t md:border-t-0 md:border-l border-white/5 bg-[#0A0A0C]">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">
                      <span>[Скриншот IDE]</span>
                      {/* Раскомментируй, когда будут реальные картинки:
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover object-left-top opacity-80 group-hover:opacity-100 transition-opacity"
                      /> 
                      */}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Кнопка "Ещё / Скрыть" */}
          {projectsData.length > 2 && (
            <motion.div layout className="flex justify-center mt-10">
              <button 
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="text-gray-400 hover:text-white text-sm font-medium border-b border-gray-500 hover:border-white transition-colors pb-0.5"
              >
                {showAllProjects ? "Скрыть" : "Ещё"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </main>
  );
}