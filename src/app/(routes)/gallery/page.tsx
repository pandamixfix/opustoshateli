"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

// БАЗА ФОТОГРАФИЙ (Вернули alt, чтобы TypeScript был счастлив)
const PHOTOS =[
  { id: 1, src: "/p1.jpg", alt: "Архив #01" },
  { id: 2, src: "/p2.jpg", alt: "Архив #02" },
  { id: 3, src: "/p3.jpg", alt: "Архив #03" },
  { id: 4, src: "/p4.jpg", alt: "Архив #04" },
  { id: 5, src: "/p5.jpg", alt: "Архив #05" },
  { id: 6, src: "/p6.jpg", alt: "Архив #06" },
  { id: 7, src: "/p7.jpg", alt: "Архив #07" },
  { id: 8, src: "/p8.jpg", alt: "Архив #08" },
  { id: 9, src: "/p9.jpg", alt: "Архив #09" },
  { id: 10, src: "/p10.jpg", alt: "Архив #10" },
  { id: 11, src: "/p11.jpg", alt: "Архив #11" },
  { id: 12, src: "/p12.jpg", alt: "Архив #12" },
  { id: 13, src: "/p13.jpg", alt: "Архив #13" },
  { id: 14, src: "/p14.jpg", alt: "Архив #14" },
  { id: 15, src: "/p15.jpg", alt: "Архив #15" },
];

export default function GalleryPage() {
  const[selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-32 px-6">
      
      {/* Заголовок */}
      <div className="w-full max-w-7xl text-center mb-20">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">
          Визуальный архив
        </p>
        <h1 className="text-4xl md:text-6xl font-playfair tracking-widest uppercase mb-10 text-zinc-100">
          Хроники
        </h1>
        <div className="w-px h-16 bg-zinc-800 mx-auto"></div>
      </div>

      <div className="w-full max-w-7xl">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6 group/gallery">
          {PHOTOS.map((photo) => (
            <div 
              key={photo.id} 
              // ИСПРАВЛЕНО: hover:!opacity-100 заменено на hover:opacity-100!
              className="relative break-inside-avoid overflow-hidden cursor-pointer transition-all duration-700 ease-out group-hover/gallery:opacity-30 hover:opacity-100! hover:scale-[1.03] hover:z-10 group/item border border-white/5"
              onClick={() => setSelectedImage(photo.src)}
            >
              {/* ИСПРАВЛЕНО: Вернули обязательный alt={photo.alt} */}
              <Image
                src={photo.src}
                alt={photo.alt}
                width={800}
                height={1200}
                className="w-full h-auto object-cover brightness-75 group-hover/item:brightness-110 transition-all duration-700"
              />
              
              {/* ИСПРАВЛЕНО: bg-gradient-to-t заменено на bg-linear-to-t */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 flex items-end p-6 sm:p-8 translate-y-4 group-hover/item:translate-y-0">
                <span className="text-sm font-playfair tracking-widest uppercase text-white drop-shadow-md">
                  {photo.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно (Lightbox) */}
      {selectedImage && (
        <div 
          // ИСПРАВЛЕНО: z-[100] заменено на z-100
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-10"
          >
            <X size={32} strokeWidth={1} />
          </button>

          <div 
            className="relative w-full max-w-5xl h-full max-h-[85vh] shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Крупный план"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}

    </main>
  );
}