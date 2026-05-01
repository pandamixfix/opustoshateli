"use client";

import { useState } from "react";

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const[isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    superpower: "",
    motivation: "",
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Отправляем данные на наш новый серверный роут
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert("Произошла ошибка при отправке. Напишите нам напрямую.");
      }
    } catch (error) {
      alert("Проблема с сетью. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="w-px h-16 bg-zinc-700 mx-auto mb-8"></div>
          <h1 className="text-3xl md:text-5xl font-playfair tracking-widest text-zinc-100 uppercase mb-6">
            Заявка принята
          </h1>
          <p className="text-sm font-inter text-zinc-400 tracking-widest uppercase mb-8">
            Ожидайте решения Совета
          </p>
          <div className="w-px h-16 bg-zinc-700 mx-auto mt-8"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-20 px-6">
      
      {/* Заголовок */}
      <div className="w-full max-w-2xl text-center mb-16">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">
          Закрытый клуб
        </p>
        <h1 className="text-4xl md:text-5xl font-playfair tracking-widest uppercase mb-8 text-zinc-100">
          Резидентура
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className={`text-xs font-playfair transition-colors duration-500 ${step >= 1 ? "text-white" : "text-zinc-700"}`}>I</span>
          <div className={`w-8 h-px transition-colors duration-500 ${step >= 2 ? "bg-white" : "bg-zinc-800"}`}></div>
          <span className={`text-xs font-playfair transition-colors duration-500 ${step >= 2 ? "text-white" : "text-zinc-700"}`}>II</span>
          <div className={`w-8 h-px transition-colors duration-500 ${step >= 3 ? "bg-white" : "bg-zinc-800"}`}></div>
          <span className={`text-xs font-playfair transition-colors duration-500 ${step >= 3 ? "text-white" : "text-zinc-700"}`}>III</span>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          
          {step === 1 && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <h2 className="text-2xl font-playfair tracking-widest uppercase text-zinc-200 text-center mb-4">
                Идентификация
              </h2>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase">
                  Имя и Фамилия
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Как к вам обращаться?"
                  className="bg-transparent border-b border-zinc-800 py-3 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase">
                  Связь (Telegram / Instagram)
                </label>
                <input
                  type="text"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="@username"
                  className="bg-transparent border-b border-zinc-800 py-3 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <h2 className="text-2xl font-playfair tracking-widest uppercase text-zinc-200 text-center mb-4">
                Потенциал
              </h2>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase">
                  В чем твоя уникальность?
                </label>
                <textarea
                  name="superpower"
                  required
                  value={formData.superpower}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Бизнес, IT, искусство, связи.. В чем вы лучшие?"
                  className="bg-transparent border-b border-zinc-800 py-3 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <h2 className="text-2xl font-playfair tracking-widest uppercase text-zinc-200 text-center mb-4">
                Мотивация
              </h2>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase">
                  Почему наш круг?
                </label>
                <textarea
                  name="motivation"
                  required
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Зачем Совету принимать вас в свои ряды?"
                  className="bg-transparent border-b border-zinc-800 py-3 text-sm font-inter text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-zinc-900">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="text-xs font-inter tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Назад
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 ? (!formData.name || !formData.contact) : !formData.superpower}
                className="text-xs font-inter tracking-[0.2em] uppercase text-zinc-100 border-b border-zinc-700 pb-1 hover:border-zinc-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !formData.motivation}
                className="text-xs font-inter tracking-[0.2em] uppercase text-black bg-zinc-100 px-8 py-3 hover:bg-white transition-all disabled:opacity-50 font-medium"
              >
                {isSubmitting ? "Отправка..." : "Отправить"}
              </button>
            )}
          </div>

        </form>
      </div>

    </main>
  );
}