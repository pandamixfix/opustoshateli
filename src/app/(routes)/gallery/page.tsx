"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Upload } from "lucide-react";
import { createClient } from "../../../lib/supabase";
import imageCompression from 'browser-image-compression';
import { uploadFiles } from "../../../lib/uploadthing";

interface Photo {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const[isAdmin, setIsAdmin] = useState(false);
  const[isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const[title, setTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const[supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadGallery() {
      // Добавили лимит в 20 фото, чтобы не перегружать страницу
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) setPhotos(data);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'Опустошатель') setIsAdmin(true);
      }
    }
    loadGallery();
  }, [supabase]);

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !photoFile) return;
    setIsUploading(true);

    try {
      // 1. Сжимаем фото (оно будет весить копейки)
      const compressedFile = await imageCompression(photoFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      });

      // 2. Отправляем в Uploadthing
      const res = await uploadFiles("mediaPost", { files: [compressedFile] });
      const publicUrl = res[0].ufsUrl;

      // 3. Сохраняем готовую ссылку в Supabase
      const { data: newPhoto, error: dbErr } = await supabase.from('gallery').insert({
        title, url: publicUrl
      }).select().single();

      if (dbErr) throw dbErr;

      setPhotos([newPhoto, ...photos]);
      setIsModalOpen(false);
      setTitle(""); setPhotoFile(null);
    } catch (err) {
      alert("Ошибка при загрузке фото.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-32 px-6 relative">
      <div className="w-full max-w-7xl text-center mb-20">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">Визуальный архив</p>
        <h1 className="text-4xl md:text-6xl font-playfair tracking-widest uppercase mb-10 text-zinc-100">Хроники</h1>
        <div className="w-px h-16 bg-zinc-800 mx-auto"></div>
      </div>

      <div className="w-full max-w-7xl">
        {photos.length === 0 ? (
          <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest text-center mt-10">Архив пуст</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6 group/gallery">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative break-inside-avoid overflow-hidden cursor-pointer transition-all duration-700 ease-out group-hover/gallery:opacity-30 hover:opacity-100! hover:scale-[1.03] hover:z-10 group/item border border-white/5"
                onClick={() => setSelectedImage(photo.url)}
              >
                <Image src={photo.url} alt={photo.title} width={800} height={1200} className="w-full h-auto object-cover brightness-75 group-hover/item:brightness-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 flex items-end p-6 sm:p-8 translate-y-4 group-hover/item:translate-y-0">
                  <span className="text-sm font-playfair tracking-widest uppercase text-white drop-shadow-md">{photo.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 md:right-12 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] z-40">
          <Plus size={24} strokeWidth={2} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 relative flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-playfair tracking-widest uppercase text-white">Добавить в архив</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleUploadPhoto} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Подпись / Место</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Псков, 2024" className="bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white" />
              </div>
              
              <div className="flex items-center gap-4">
                <input type="file" required ref={fileInputRef} onChange={e => setPhotoFile(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 py-4 text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                  <Upload size={16} /> {photoFile ? "Фото выбрано" : "Загрузить фотографию"}
                </button>
              </div>

              <button type="submit" disabled={isUploading} className="mt-4 bg-white text-black py-4 text-xs font-inter tracking-widest uppercase font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {isUploading ? "Загрузка..." : "Опубликовать"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-10"><X size={32} strokeWidth={1} /></button>
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] shadow-[0_0_100px_rgba(255,255,255,0.05)]" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImage} alt="Крупный план" fill className="object-contain" sizes="100vw"  />
          </div>
        </div>
      )}
    </main>
  );
}