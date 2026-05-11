"use client";
import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GlassInput = ({ className = "", ...props }: GlassInputProps) => {
  return (
    <input
      className={`
        w-full px-6 py-4 rounded-xl
        bg-white/[0.03] border border-white/10
        text-white placeholder:text-gray-500
        focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
        backdrop-blur-md transition-all duration-300
        ${className}
      `}
      {...props}
    />
  );
};