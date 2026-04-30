"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const[isMenuOpen, setIsMenuOpen] = useState(false);

  // Магия: Блокируем скролл сайта, когда меню открыто (чтобы фон не дергался)
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>

      <header className="fixed top-0 left-0 right-0 z-60 bg-black/70 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          <Link href="/" className="font-playfair text-xl md:text-2xl tracking-[0.2em] uppercase text-white hover:text-zinc-300 transition-colors relative z-50" onClick={closeMenu}>
            Опустошатели
          </Link>


          <nav className="hidden md:flex gap-10">
            <Link href="/manifest" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Манифест
            </Link>
            <Link href="/tracks" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Музыка
            </Link>
            <Link href="/gallery" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Хроники
            </Link>
            <Link href="/apply" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Резидентура
            </Link>
          </nav>


          <button 
            className="md:hidden relative z-50 text-zinc-300 hover:text-white transition-colors p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
          </button>
        </div>
      </header>

      <div 
        className={`fixed inset-0 z-55 bg-black/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out flex flex-col justify-center px-8 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-8">
          <Link 
            href="/" 
            onClick={closeMenu}
            className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-100 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Главная
          </Link>
          <Link 
            href="/manifest" 
            onClick={closeMenu}
            className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-150 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Манифест
          </Link>
          <Link 
            href="/tracks" 
            onClick={closeMenu}
            className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-200 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Музыка
          </Link>
          <Link 
            href="/gallery" 
            onClick={closeMenu}
            className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-200 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Хроники
          </Link>
          
          <div className={`h-px w-full bg-zinc-800 my-4 transition-all duration-500 delay-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}></div>
          
          <Link 
            href="/apply" 
            onClick={closeMenu}
            className={`text-sm font-inter tracking-[0.3em] uppercase text-zinc-400 hover:text-white transition-all duration-500 delay-300 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Подать заявку в клуб
          </Link>
        </nav>
      </div>
    </>
  );
}