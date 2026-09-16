"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { MouseEvent } from "react";

const leftColData =[
  { id: 'tg', iconSrc: "/assets/tg-icon.png", label: "TELEGRAM" },
  { id: 'vs', iconSrc: "/assets/vscode-icon.png", label: "VS CODE" },
  { id: 'nx', iconSrc: "/assets/next-icon.png", label: "NEXT JS" },
];

const rightColData =[
  { id: 'py', iconSrc: "/assets/pycharm-icon.png", label: "PYCHARM" },
  { id: 'pg', iconSrc: "/assets/postgres-icon.png", label: "POSTGRESQL" },
  { id: 'gh', iconSrc: "/assets/github-icon.png", label: "GITHUB" },
];

export const OurStackSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-32 px-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* ЛЕВАЯ ЧАСТЬ: Анимируем появление */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="relative flex flex-col justify-center h-full min-h-[400px]"
        >
          <div className="absolute top-0 left-0 w-[80%] h-[80%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative h-48 w-full max-w-xs mb-8">
            <Floating3DIcon src="/assets/3d-python.png" className="top-[0%] left-[10%] w-20" delay={0} />
            <Floating3DIcon src="/assets/3d-js.png" className="top-[40%] left-[0%] w-16" delay={0.2} />
            <Floating3DIcon src="/assets/3d-react.png" className="top-[30%] left-[35%] w-16" delay={0.4} />
          </div>

          <motion.h2 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="text-4xl md:text-6xl font-medium tracking-tight text-white relative z-10 leading-tight"
          >
            Наш стек <br /> технологий
          </motion.h2>
        </motion.div>

        {/* ПРАВАЯ ЧАСТЬ: Плавное появление бегущей строки */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[550px]"
        >
          <div className="flex gap-4 h-full">
            <MarqueeColumn items={leftColData} direction="down" speed={20} />
            <MarqueeColumn items={rightColData} direction="up" speed={20} mt="mt-16" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

const MarqueeColumn = ({ items, direction, speed, mt = "" }: { items: any[], direction: "up"|"down", speed: number, mt?: string }) => {
  return (
    <div 
      className={`flex-1 relative overflow-hidden h-full ${mt}`}
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
      }}
    >
      <motion.div
        animate={{
          y: direction === "up" ? ["0%", "-50%"] :["-50%", "0%"]
        }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity
        }}
        className="flex flex-col w-full"
      >
        <div className="flex flex-col gap-4 pb-4">
          {items.map((item, idx) => (
            <StackCard key={`set1-${item.id}-${idx}`} iconSrc={item.iconSrc} label={item.label} />
          ))}
        </div>
        <div className="flex flex-col gap-4 pb-4">
          {items.map((item, idx) => (
            <StackCard key={`set2-${item.id}-${idx}`} iconSrc={item.iconSrc} label={item.label} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const Floating3DIcon = ({ src, className, delay }: { src: string, className: string, delay: number }) => {
  return (
    <motion.div
      // Комбинируем анимацию появления (opacity/scale) и бесконечное парение (y)
      variants={{
        hidden: { opacity: 0, scale: 0.5 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { duration: 0.5, ease: "backOut" } 
        }
      }}
      className={`absolute z-10 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
        className="relative w-full aspect-square drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
      >
        <Image src={src} alt="3d-tech" fill className="object-contain" />
      </motion.div>
    </motion.div>
  );
};

const StackCard = ({ iconSrc, label }: { iconSrc: string, label: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      className="relative group flex flex-col items-center justify-center gap-4 h-48 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden flex-shrink-0"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(150px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.08), transparent 80%)
          `,
        }}
      />
      <div className="relative z-10 w-14 h-14 transition-transform group-hover:scale-110 duration-500">
        <Image src={iconSrc} alt={label} fill className="object-contain" />
      </div>
      <span className="relative z-10 text-[10px] tracking-widest text-gray-500 font-medium group-hover:text-gray-300 transition-colors uppercase mt-2">
        {label}
      </span>
    </motion.div>
  );
};