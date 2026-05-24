"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";

import { GlowingBackground } from "@/components/ui/glowing-bg";
import { LiquidButton } from "@/components/ui/liquid-button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  User, LogOut, Camera, Pencil, Check, X, 
  Eye, EyeOff 
} from "lucide-react";
import Link from "next/link";

// --- ТИПЫ ---
interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  statusColor: string;
}

// --- МОКОВЫЕ ДАННЫЕ ПРОЕКТОВ ---
const projectsData: Project[] = [
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
  customer: "Заказчик",
  student: "Студент",
  manager: "Менеджер",
  admin: "Администратор",
};

export default function DashboardPage() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAllProjects, setShowAllProjects] = useState(false);

  // Состояния редактирования профиля
  const [editTarget, setEditTarget] = useState<null | "name" | "email" | "password">(null);
  const [tempValue, setTempValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const displayedProjects = showAllProjects ? projectsData : projectsData.slice(0, 2);

  const handleStartEdit = (target: "name" | "email" | "password", currentVal: string) => {
    setEditTarget(target);
    // Для пароля мы всегда начинаем с пустого поля при редактировании
    setTempValue(target === "password" ? "" : currentVal);
    setError("");
    setShowPassword(false);
  };

  const handleSave = async () => {
    // 1. Проверка на изменения
    if (editTarget === "name" && tempValue.trim() === user.first_name) return setEditTarget(null);
    if (editTarget === "email" && tempValue.trim() === user.email) return setEditTarget(null);
    if (editTarget === "password" && !tempValue.trim()) return setEditTarget(null);

    if (!user.passwordRaw) {
      setError("Сессия устарела. Пожалуйста, перезайдите в аккаунт.");
      return;
    }

    setIsUpdating(true);
    setError("");
    
    try {
      let endpoint = "";
      let headerKey = "";

      if (editTarget === "name") {
        endpoint = "/api/users/update/names";
        headerKey = "new_first_name"; // ИСПРАВЛЕНО НА ПРАВИЛЬНЫЙ КЛЮЧ
      } else if (editTarget === "email") {
        endpoint = "/api/users/update/email";
        headerKey = "new_email";
      } else {
        endpoint = "/api/users/update/password";
        headerKey = "new_password";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          [headerKey]: tempValue.trim()
        },
        body: JSON.stringify({ email: user.email, password: user.passwordRaw }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        let backendError = "Ошибка сервера";
        if (data.detail) {
          if (typeof data.detail === "string") backendError = data.detail;
          else if (Array.isArray(data.detail)) backendError = typeof data.detail[0] === "string" ? data.detail[0] : data.detail[0]?.msg || "Ошибка валидации";
        } else if (data.error) {
          backendError = typeof data.error === "string" ? data.error : data.error[0];
        }
        throw new Error(backendError);
      }

      const updatedUser = { ...user };
      if (editTarget === "name") updatedUser.first_name = tempValue.trim();
      if (editTarget === "email") updatedUser.email = tempValue.trim();
      if (editTarget === "password") updatedUser.passwordRaw = tempValue.trim();
      
      login(updatedUser);
      setEditTarget(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderField = (label: string, target: "name" | "email" | "password", currentValue: string, isPassword = false) => {
    const isEditing = editTarget === target;
    
    // ИСТИННАЯ ЛОГИКА ОТОБРАЖЕНИЯ:
    // Если мы редактируем - показываем то, что печатают (tempValue).
    // Если мы смотрим пароль - показываем НАСТОЯЩИЙ пароль (user.passwordRaw).
    // Если мы смотрим обычное поле - показываем currentValue.
    const actualValue = isEditing ? tempValue : (isPassword ? (user.passwordRaw || "") : currentValue);
    
    // Тип инпута зависит ТОЛЬКО от состояния showPassword и от того, пароль ли это.
    const inputType = isPassword && !showPassword ? "password" : "text";

    return (
      <div className="w-full mb-6">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">{label}</p>
        
        <div className={`
          relative w-full flex items-center rounded-xl transition-all duration-300
          bg-white/[0.03] border backdrop-blur-md px-5 py-3
          ${isEditing ? "border-white/30 bg-white/[0.06] shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "border-white/10"}
        `}>
          <input
            type={inputType}
            value={actualValue}
            readOnly={!isEditing}
            onChange={(e) => setTempValue(e.target.value)}
            className={`
              flex-1 bg-transparent border-none outline-none text-white text-sm md:text-base tracking-wide
              ${isEditing ? "placeholder:text-gray-600" : ""}
            `}
            placeholder={isEditing && isPassword ? "Введите новый пароль" : ""}
          />
          
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {isPassword && (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {isEditing ? (
              <>
                <button 
                  type="button"
                  onClick={async (e) => { e.preventDefault(); await handleSave(); }} 
                  disabled={isUpdating} 
                  className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setEditTarget(null); setError(""); }} 
                  disabled={isUpdating} 
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); handleStartEdit(target, isPassword ? "" : currentValue); }} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isEditing && error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: "auto", marginTop: 8 }} 
              exit={{ opacity: 0, height: 0, marginTop: 0 }} 
              className="overflow-hidden"
            >
              <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden flex flex-col pb-20">
      <GlowingBackground />

      <motion.section
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32"
      >
        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-medium text-center mb-20 tracking-tight">
          Личный кабинет
        </motion.h1>

        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-start justify-start gap-12 md:gap-20 mb-28 relative">
          
          <button onClick={logout} className="absolute -top-10 right-0 text-gray-500 hover:text-red-400 flex items-center gap-2 transition-colors text-xs uppercase tracking-widest">
            <LogOut size={14} /> Выйти
          </button>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative shrink-0 w-48 h-48 md:w-56 md:h-56 rounded-full bg-[#1A1A1E] flex items-center justify-center border border-white/5 shadow-2xl overflow-hidden cursor-pointer"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `/it-incubator${user.avatar_url}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-[#2A2A30]" strokeWidth={1} />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-[9px] uppercase tracking-widest font-bold">Изменить</span>
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const formData = new FormData(); formData.append("file", file);
              const res = await fetch("/api/users/update/avatar", { method: "POST", headers: { "user_id": String(user.id) }, body: formData });
              const data = await res.json(); if (res.ok) login({ ...user, avatar_url: data.avatar_url });
            }} />
          </div>

          <div className="w-full max-w-lg">
            {renderField("Имя", "name", user.first_name)}
            {renderField("Электронная почта", "email", user.email)}
            {renderField("Пароль", "password", "", true)}

            <div className="pt-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Статус</p>
              <div className="w-full px-5 py-3.5 rounded-xl bg-white/[0.01] border border-white/[0.05] text-gray-400 text-sm">
                {roleTranslations[user.role] || user.role}
              </div>
            </div>
          </div>
        </motion.div>

        {/* БЛОК ПРОЕКТОВ */}
        <motion.div variants={fadeInUp} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight">Мои проекты</h2>
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
              {displayedProjects.map((project: Project) => (
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