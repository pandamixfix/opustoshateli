"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";
import { createClient } from "../../../lib/supabase";

export default function AuthPage() {
  const[isLogin, setIsLogin] = useState(true);
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[name, setName] = useState(""); 
  const[avatar, setAvatar] = useState<File | null>(null); 
  const[avatarPreview, setAvatarPreview] = useState<string | null>(null); 
  const[loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // ИСПРАВЛЕНИЕ ЗДЕСЬ: "Замораживаем" базу, чтобы клоны не плодились при вводе текста
  const [supabase] = useState(() => createClient());

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        window.dispatchEvent(new Event('profileUpdated'));
        router.push("/profile");
        
        setTimeout(() => setLoading(false), 1000);
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { display_name: name } }
        });
        if (authError) throw authError;

        if (authData.user) {
          let avatarUrl = null;

          if (avatar) {
            const fileExt = avatar.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatar, { upsert: true });

            if (!uploadError) {
              const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
              avatarUrl = data.publicUrl;
            }
          }

          await supabase.from('profiles').upsert({ 
              id: authData.user.id, 
              avatar_url: avatarUrl,
              display_name: name || email.split('@')[0],
              role: 'Резидент'
          });
        }
        
        setMessage({ text: "Регистрация успешна! Теперь вы можете войти.", type: "success" });
        setIsLogin(true);
        setLoading(false); 
      }
    } catch (error: unknown) {
      let errorText = "Произошла ошибка";
      if (error instanceof Error) {
        errorText = error.message;
        if (errorText.includes("Invalid login credentials")) {
          errorText = "Неверная почта или пароль. Либо аккаунта не существует.";
        } else if (errorText.includes("User already registered")) {
          errorText = "Эта почта уже занята другим резидентом.";
        } else if (errorText.includes("Password should be at least")) {
          errorText = "Пароль слишком короткий (минимум 6 символов).";
        }
      }
      setMessage({ text: errorText, type: "error" });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center pt-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col z-10">
        <div className="text-center mb-12">
          <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-4">
            Доступ в систему
          </p>
          <h1 className="text-4xl font-playfair tracking-widest uppercase text-zinc-100">
            {isLogin ? "Идентификация" : "Регистрация"}
          </h1>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          {!isLogin && (
            <>
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  className="relative w-24 h-24 rounded-full border border-zinc-700 bg-zinc-900/50 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-zinc-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <Upload size={24} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-inter uppercase tracking-widest text-white">Выбрать</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase ml-1">
                  Имя (Никнейм)
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как вас называть?"
                  className="bg-zinc-900/50 border border-zinc-800 rounded-none px-4 py-4 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase ml-1">
              Электронная почта
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@opustoshateli.com"
              className="bg-zinc-900/50 border border-zinc-800 rounded-none px-4 py-4 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase ml-1">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900/50 border border-zinc-800 rounded-none px-4 py-4 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {message && (
            <div className={`p-4 text-xs font-inter tracking-wider uppercase text-center border ${
              message.type === "error" ? "border-red-900/50 text-red-500 bg-red-950/20" : "border-green-900/50 text-green-500 bg-green-950/20"
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-zinc-100 text-black px-4 py-4 text-xs font-inter tracking-[0.2em] uppercase font-medium hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "ОБРАБОТКА..." : isLogin ? "ВОЙТИ В СИСТЕМУ" : "ОТПРАВИТЬ ЗАПРОС"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-[10px] font-inter tracking-[0.2em] text-zinc-500 hover:text-zinc-300 uppercase transition-colors"
          >
            {isLogin ? "Нет аккаунта? Пройти регистрацию" : "Уже зарегистрированы? Войти в систему"}
          </button>
        </div>
      </div>
    </main>
  );
}