"use client";
import { motion } from "framer-motion";

export const GlowingBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0B0F]">
      {/* Синее пятно слева */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[20%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]"
      />
      
      {/* Фиолетовое/Золотое пятно справа */}
      <motion.div
        animate={{
          x:[0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-[10%] top-[10%] h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[150px]"
      />
      
      {/* Акцентное светлое пятно по центру внизу */}
      <motion.div
        animate={{
          scale:[1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[40%] bottom-[-10%] h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[100px]"
      />
    </div>
  );
};