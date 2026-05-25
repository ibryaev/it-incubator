"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  role: string;
  passwordRaw?: string; 
  avatar_url?: string | null; 
  orders_created?: number[]; 
  orders_pinned?: number[]; 
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthLoading: boolean; 
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  login: () => {}, 
  logout: () => {}, 
  isAuthLoading: true 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    // Завершили проверку памяти
    setIsAuthLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);