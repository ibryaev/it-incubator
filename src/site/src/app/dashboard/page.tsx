"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassInput } from "@/components/ui/glass-input";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { User, LogOut, Camera, Pencil, Check, X } from "lucide-react";
import Link from "next/link";

// --- МОКОВЫЕ ДАННЫЕ ПРОЕКТОВ ---
const projectsData = [
  {
    id: 1,
    title: "Сайт дачного поселка",
    description: "Официальный сайт дачного поселка Зеленые Дачи. Вся информация о свободных участках и ценах.",
    status: "В разработке",
    statusColor: "text-yellow-500",
  },
  {
    id: 2,
    title: "Парсер СМИ",
    description: "Информационный ресурс. Публикация нормативной документации и новостей для жителей.",
    status: "Готов",
    statusColor: "text-green-500",
  },
  {
    id: 3,
    title: "Telegram-бот для заявок",
    description: "Бот для автоматического сбора заявок от клиентов и интеграции с CRM-системой.",
    status: "Готов",
    statusColor: "text-green-500",
  },
  {
    id: 4,
    title: "Внутренний дашборд",
    description: "Админ-панель для мониторинга активности пользователей и управления доступом.",
    status: "В разработке",
    statusColor: "text-yellow-500",
  },
];

// --- АНИМАЦИИ ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const roleTranslations: Record<string, string> = {
  customer: "заказчик",
  student: "студент",
  manager: "менеджер",
  admin: "администратор",
};

export default function DashboardPage() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояния для проектов
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Состояния для редактирования профиля
  const [editMode, setEditMode] = useState<null | "name" | "password">(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const displayedProjects = showAllProjects ? projectsData : projectsData.slice(0, 2);

  // Функция для безопасного запроса к API
  const handleProfileUpdate = async () => {
    if (!editValue.trim()) return setEditMode(null);
    setIsUpdating(true);
    setError("");

    try {
      const isName = editMode === "name";
      const endpoint = isName ? "/api/users/update/names" : "/api/users/update/password";
      
      // В твоем бэкенде в alias указано "new_fist_name" (с опечаткой) и "new_password"
      const headerKey = isName ? "new_fist_name" : "new_password";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          [headerKey]: editValue.trim()
        },
        // Большинство твоих методов обновления требуют UserLogin в теле для проверки
        body: JSON.stringify({
          email: user.email,
          password: user.passwordRaw // Берем из контекста сохраненный при входе пароль
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail?.[0] || data.detail || "Ошибка обновления");
      }

      // Обновляем данные в контексте (чтобы Header и Dashboard сразу увидели изменения)
      if (isName) {
        login({ ...user, first_name: editValue.trim() });
      } else {
        login({ ...user, passwordRaw: editValue.trim() });
      }

      setEditMode(null);
      setEditValue("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Логика загрузки аватарки
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/users/update/avatar", {
        method: "POST",
        headers: { "user_id": String(user.id) },
        body: formData
      });
      const data = await res.json();
      if (res.ok) login({ ...user, avatar_url: data.avatar_url });
    } catch (err) {
      console.error("Ошибка загрузки фото", err);
    }
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col pb-20">
      <GlowingBackground />

      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32"
      >
        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-medium text-center mb-16 tracking-tight">
          Личный кабинет
        </motion.h1>

        {/* БЛОК ПРОФИЛЯ */}
        <motion.div variants={fadeInUp} className="w-full flex flex-col md:flex-row items-center justify-start gap-12 md:gap-24 lg:gap-32 mb-32 relative">
          
          <button onClick={logout} className="absolute top-0 right-0 text-gray-500 hover:text-red-400 flex items-center gap-2 transition-colors text-sm font-medium">
            <LogOut size={16} /> Выйти
          </button>

          {/* АВАТАРКА */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#1A1A1E] flex items-center justify-center border border-white/5 shadow-2xl overflow-hidden cursor-pointer"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-24 h-24 md:w-28 md:h-28 text-[#2A2A30]" strokeWidth={1.5} />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-[10px] uppercase tracking-widest font-bold">изменить фото</span>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
          </div>

          {/* ИНФО */}
          <div className="w-full max-w-md space-y-6">
            {/* ИМЯ */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">имя</p>
              {editMode === "name" ? (
                <div className="flex gap-2">
                  <GlassInput value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Новое имя" autoFocus />
                  <button onClick={handleProfileUpdate} disabled={isUpdating} className="p-3 bg-white/5 hover:bg-green-500/20 rounded-xl transition-colors border border-white/5 text-green-400">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setEditMode(null)} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-colors border border-white/5 text-red-400">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-semibold">{user.first_name} {user.last_name || ""}</h2>
                  <button onClick={() => { setEditMode("name"); setEditValue(user.first_name); }} className="text-gray-500 hover:text-white transition-colors">
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">почта</p>
              <div className="bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-md w-full">
                <span className="font-medium text-gray-200 opacity-60">{user.email}</span>
              </div>
            </div>

            {/* ПАРОЛЬ */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">пароль</p>
              {editMode === "password" ? (
                <div className="flex gap-2">
                  <GlassInput type="password" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Новый пароль" autoFocus />
                  <button onClick={handleProfileUpdate} disabled={isUpdating} className="p-3 bg-white/5 hover:bg-green-500/20 rounded-xl transition-colors border border-white/5 text-green-400">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setEditMode(null)} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-colors border border-white/5 text-red-400">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setEditMode("password"); setEditValue(""); }}
                  className="text-sm text-gray-400 hover:text-white border-b border-gray-600 hover:border-white transition-all pb-0.5"
                >
                  сменить пароль
                </button>
              )}
            </div>

            {error && <p className="text-red-400 text-xs italic">{error}</p>}

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">Мои проекты</h2>
            <Link href="/new-project">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LiquidButton className="px-8 py-3 text-sm font-semibold uppercase tracking-wider">
                  Новая заявка
                </LiquidButton>
              </motion.div>
            </Link>
          </div>

          <motion.div layout className="space-y-6 w-full">
            <AnimatePresence>
              {displayedProjects.map((project) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4 }}
                  className="group relative flex flex-col md:flex-row bg-[#131316] border border-white/5 rounded-2xl overflow-hidden hover:bg-[#18181b] transition-colors duration-300"
                >
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                    <div className="space-y-4 mb-8">
                      <h3 className="text-2xl md:text-3xl font-medium text-white">{project.title}</h3>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">{project.description}</p>
                    </div>
                    <span className={`text-sm font-medium ${project.statusColor}`}>{project.status}</span>
                  </div>
                  <div className="relative w-full md:w-5/12 min-h-[250px] md:min-h-full border-t md:border-t-0 md:border-l border-white/5 bg-[#0A0A0C]">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm italic">
                      <span>[Скриншот разработки]</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

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