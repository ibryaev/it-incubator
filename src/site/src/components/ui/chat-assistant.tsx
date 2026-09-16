"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MessageCircle, X, Maximize2, Minimize2, Send, Loader2, AlertCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant" | "error";
  content: string;
};

const fadeInUpAnimation: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    transition: { duration: 0.4, ease: "easeIn" } 
  }
};

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Я ИИ-помощник инкубатора. Чем могу помочь?" }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== "error")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Сервер вернул некорректный формат данных (не JSON)");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Произошла системная ошибка при обращении к ИИ");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: "error", 
        content: `Ошибка: ${err.message}. Попробуйте позже.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* КНОПКА ОТКРЫТИЯ (Плавающая) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#141419]/80 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/[0.08] transition-colors"
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* САМ ЧАТ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={fadeInUpAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 flex flex-col bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${
              isFullScreen
                ? "inset-4 md:inset-10 rounded-[30px]"
                : "bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] rounded-[24px]"
            }`}
          >
            {/* ШАПКА ЧАТА */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </div>
                <h3 className="text-white text-sm font-semibold tracking-wider uppercase">ИИ Ассистент</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 hover:text-white transition-colors">
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ОБЛАСТЬ СООБЩЕНИЙ */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600/20 border border-purple-500/20 text-white rounded-br-none"
                        : msg.role === "error"
                        ? "bg-red-500/10 border border-red-500/20 text-red-200 w-full flex gap-3 items-start"
                        : "bg-white/[0.04] border border-white/5 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {/* Лоадер при ожидании ответа */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/5 text-gray-400 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs uppercase tracking-wider">Думает...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ПОЛЕ ВВОДА */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спросите что-нибудь..."
                  className="w-full pl-5 pr-14 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all resize-none overflow-hidden h-[54px]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};