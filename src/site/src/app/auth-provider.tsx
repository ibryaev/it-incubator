// src/app/auth-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  role: string;
  passwordRaw?: string; // Сохраняем пароль локально, так как твой API требует его для обновлений
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // При загрузке страницы достаем юзера из localStorage
  useEffect(() => {
    const stored = localStorage.getItem("app_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("app_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("app_user");
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);