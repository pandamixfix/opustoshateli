"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useUser } from "../../hooks/useUser";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile } = useUser();

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

          <nav className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => window.dispatchEvent(new Event('openWelcomeModal'))} 
              className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              О нас
            </button>
            <Link href="/manifest" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Манифест
            </Link>
            <Link href="/tracks" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Музыка
            </Link>
            <Link href="/gallery" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Хроники
            </Link>
            <Link href="/wall" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
              Новости
            </Link>

            {(!profile || profile.role !== 'Опустошатель') && (
              <Link href="/apply" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
                Резидентура
              </Link>
            )}
            
            {profile ? (
              <Link href="/profile" className="flex items-center gap-3 group">
                <span className="text-xs font-inter tracking-widest uppercase text-zinc-400 group-hover:text-white transition-colors">
                  {profile.display_name}
                </span>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 group-hover:border-zinc-400 transition-colors">
                  <Image src={profile.avatar_url || "/default-cover.jpg"} alt="Аватар" fill className="object-cover" sizes="32px"/>
                </div>
              </Link>
            ) : (
              <Link href="/auth" className="text-xs font-inter tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
                Вход
              </Link>
            )}
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
        className={`fixed inset-0 z-55 bg-black/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out flex flex-col justify-center px-8 h-dvh pb-[env(safe-area-inset-bottom)] ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-8">
          <Link href="/" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-100 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Главная
          </Link>
          
          <button 
            onClick={() => { closeMenu(); window.dispatchEvent(new Event('openWelcomeModal')); }} 
            className={`text-4xl font-playfair text-left tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-150 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            О нас
          </button>

          <Link href="/manifest" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-150 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Манифест
          </Link>
          <Link href="/tracks" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-200 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Музыка
          </Link>
          <Link href="/gallery" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-200 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Хроники
          </Link>
          <Link href="/wall" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-200 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            Стена
          </Link>

          <div className={`h-px w-full bg-zinc-800 my-4 transition-all duration-500 delay-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}></div>
          
          {(!profile || profile.role !== 'Опустошатель') && (
            <Link href="/apply" onClick={closeMenu} className={`text-sm font-inter tracking-[0.3em] uppercase text-zinc-400 hover:text-white transition-all duration-500 delay-300 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              Подать заявку в клуб
            </Link>
          )}

          {profile ? (
            <Link href="/profile" onClick={closeMenu} className={`flex items-center gap-4 transition-all duration-500 delay-250 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
               <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                  <Image src={profile.avatar_url || "/default-cover.jpg"} alt="Аватар" fill className="object-cover" sizes="48px"/>
                </div>
                <span className="text-2xl font-playfair tracking-widest uppercase text-zinc-100">
                  Кабинет
                </span>
            </Link>
          ) : (
            <Link href="/auth" onClick={closeMenu} className={`text-4xl font-playfair tracking-widest uppercase text-zinc-100 transition-all duration-500 delay-250 ${isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              Вход
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}