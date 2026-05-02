"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "../../lib/supabase";

export default function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Слушатель для открытия окна по клику на кнопку в меню
    const handleOpen = () => setIsVisible(true);
    window.addEventListener('openWelcomeModal', handleOpen);

    // 2. Логика первичного показа
    async function checkStatus() {
      const hasSeen = localStorage.getItem("opustoshateli_welcome_seen");
      if (hasSeen) return;

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        localStorage.setItem("opustoshateli_welcome_seen", "true");
        return;
      }
      setIsVisible(true);
    }
    
    checkStatus();

    // Очищаем слушатель при размонтировании
    return () => window.removeEventListener('openWelcomeModal', handleOpen);
  },[]);

  const handleClose = () => {
    localStorage.setItem("opustoshateli_welcome_seen", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col items-center text-center"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
            >
              <X size={20} />
            </button>

            <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">
              Вводный инструктаж
            </p>
            <h2 className="text-3xl font-playfair tracking-widest uppercase mb-8 text-zinc-100">
              Кто такие Опустошатели?
            </h2>
            
            <div className="w-px h-12 bg-zinc-800 mx-auto mb-8"></div>
            
            <div className="flex flex-col gap-5 text-sm font-inter text-zinc-400 leading-relaxed text-justify md:text-center mb-10">
              <p>
                Мы — не секта, не инфоцыгане и не элитный бизнес-клуб по платной подписке. 
              </p>
              <p>
                Мы — узкий круг друзей, которые на максимальных скоростях двигаются к своим целям. В нашем комьюнити мы работаем, играем, отрываемся и развиваемся бок о бок. 
              </p>
              <p>
                Мы ничего никому не продаем и ни к чему не принуждаем. Мы просто ломаем рамки, кайфуем от процесса и живем свою лучшую жизнь.
              </p>
            </div>

            <button 
              onClick={handleClose}
              className="bg-white text-black px-8 py-4 text-xs font-inter tracking-[0.2em] uppercase font-medium hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
              Погрузиться в вайб
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}