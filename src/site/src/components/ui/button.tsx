"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import React, { MouseEvent } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "glass" | "ghost";
  children: React.ReactNode;
}

export const Button = ({ variant = "gradient", children, className = "", ...props }: ButtonProps) => {
  // Координаты для эффекта искажения/блика
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const baseStyles = "relative rounded-full px-8 py-3 font-medium transition-all duration-500 flex items-center justify-center overflow-hidden group";
  
  const variants = {
    gradient: "bg-gradient-to-r from-[#5B8DEF] to-[#A070D6] text-white shadow-lg",
    
    // ЭФФЕКТ ЖИДКОГО СТЕКЛА (LIQUID GLASS)
    glass: `
      bg-white/[0.01] 
      backdrop-blur-2xl 
      backdrop-saturate-[180%] 
      border border-white/10 
      border-t-white/30 
      text-white/90
      hover:text-white
      shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_10px_40px_-10px_rgba(0,0,0,0.5)]
    `,
    
    ghost: "text-gray-300 hover:text-white",
  };

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Слой с "жидким" бликом, который следует за мышкой */}
      {variant === 'glass' && (
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                120px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.15),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Эффект "линзы" (глянцевый отсвет сверху) */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      )}
      
      <span className="relative z-10 tracking-wide text-sm uppercase font-semibold">
        {children}
      </span>
    </motion.button>
  );
};