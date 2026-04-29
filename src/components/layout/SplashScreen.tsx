"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Через 2 секунды прячем заставку
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  },[]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-100 bg-black flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="text-2xl md:text-4xl font-playfair tracking-[0.4em] uppercase text-zinc-200">
              Опустошатели
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
              className="h-px bg-zinc-600"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}