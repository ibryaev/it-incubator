"use client";
import { motion } from "framer-motion";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "glass" | "ghost";
  children: React.ReactNode;
}

export const Button = ({ variant = "gradient", children, className = "", ...props }: ButtonProps) => {
  const baseStyles = "rounded-full px-6 py-2.5 font-medium transition-colors flex items-center justify-center";
  
  const variants = {
    gradient: "bg-gradient-to-r from-[#5B8DEF] to-[#A070D6] text-white shadow-lg", // Подбери цвета из фигмы
    glass: "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md",
    ghost: "text-gray-300 hover:text-white",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};