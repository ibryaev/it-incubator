"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/app/auth-provider";
import {
  MessageCircle,
  X,
  Maximize2,
  Minimize2,
  ArrowUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Message = {
  role: "user" | "assistant" | "error";
  content: string;
};

const fadeInUpAnimation: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

export const ChatAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Я ИИ-помощник инкубатора. Чем могу помочь?" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Авторастягивание поля ввода (как в Qwen Studio)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role !== "error")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: apiMessages,
            credentials: user?.passwordRaw
                ? { email: user.email, password: user.passwordRaw }
                : null,
            }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Сервер вернул некорректный формат данных (не JSON)");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Произошла системная ошибка при обращении к ИИ");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: `Ошибка: ${err.message}. Попробуйте позже.` },
      ]);
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

  const canSend = !!input.trim() && !isLoading;

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
                  {msg.role === "error" ? (
                    <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed bg-red-500/10 border border-red-500/20 text-red-200 flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>{msg.content}</div>
                    </div>
                  ) : msg.role === "user" ? (
                    <div className="max-w-[85%] p-4 rounded-2xl rounded-br-none text-sm leading-relaxed bg-purple-600/20 border border-purple-500/20 text-white whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-none text-sm leading-relaxed bg-white/[0.04] border border-white/5 text-gray-200">
                      <div className="chat-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
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

            {/* ПОЛЕ ВВОДА (в стиле Qwen Studio) */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 transition-colors focus-within:border-purple-500/50 focus-within:bg-white/[0.05]">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спросите что-нибудь..."
                  rows={1}
                  className="flex-1 bg-transparent py-1.5 text-white text-sm placeholder:text-gray-500 focus:outline-none resize-none overflow-y-auto max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  title="Отправить"
                  className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-all duration-200 ${
                    isLoading
                      ? "bg-white/10 text-gray-400 cursor-wait"
                      : canSend
                      ? "bg-white text-black hover:bg-purple-200 active:scale-95 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                      : "bg-white/10 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};