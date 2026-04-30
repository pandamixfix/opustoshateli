"use client"; // <-- Теперь это клиентский компонент для отслеживания касаний

import Link from "next/link";
import Image from "next/image";

interface Socials {
  tg?: string;
  vk?: string;
  inst?: string;
}

interface MemberCardProps {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  socials: Socials;
  priority?: boolean;
}

export default function MemberCard({ name, role, description, imageUrl, socials, priority = false }: MemberCardProps) {
  
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <div 
      className="group relative flex flex-col items-center p-6 border border-zinc-800 bg-black hover:bg-zinc-900/50 transition-colors duration-500 select-none"
      style={{ WebkitTouchCallout: "none" }}
      onTouchStart={triggerHaptic}
    >
      
      <div className="relative w-full aspect-3/4 overflow-hidden mb-8 border border-white/5 pointer-events-none">
        <Image
          src={imageUrl || "/default-cover.jpg"}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          draggable={false}
          className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-active:grayscale-0 group-active:opacity-100 group-hover:scale-105 group-active:scale-105 transition-all duration-700 ease-in-out pointer-events-none select-none"
        />
        
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 md:hidden opacity-50">
          <span className="text-[9px] font-inter uppercase tracking-widest text-zinc-300">
            Удерживайте
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-playfair tracking-widest text-zinc-100 mb-2 uppercase text-center">
        {name}
      </h3>
      <p className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase mb-6 text-center">
        {role}
      </p>
      
      <p className="text-sm font-inter text-zinc-400 text-center leading-relaxed mb-8 grow">
        {description}
      </p>

      <div className="flex gap-6 mt-auto">
        {socials.tg && (
          <Link href={socials.tg} target="_blank" className="text-xs font-inter tracking-[0.2em] text-zinc-600 hover:text-zinc-200 transition-colors uppercase">
            Telegram
          </Link>
        )}
        {socials.vk && (
          <Link href={socials.vk} target="_blank" className="text-xs font-inter tracking-[0.2em] text-zinc-600 hover:text-zinc-200 transition-colors uppercase">
            VK
          </Link>
        )}
      </div>
    </div>
  );
}