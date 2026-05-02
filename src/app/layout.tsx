import type { Metadata, Viewport } from "next"; // ДОБАВИЛИ Viewport
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

import Header from "../components/layout/Header";
import GlobalPlayer from "../components/layout/GlobalPlayer";
import SplashScreen from "../components/layout/SplashScreen";

const playfair = Playfair_Display({ 
  subsets:["latin", "cyrillic"], 
  variable: "--font-playfair" 
});

const inter = Inter({ 
  subsets:["latin", "cyrillic"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "ОПУСТОШАТЕЛИ | Закрытый клуб",
  description: "Официальный сайт. Саморазвитие, бизнес, музыка и стиль жизни.",
};

// МАГИЯ: Жестко запрещаем мобильным браузерам зумить экран при клике
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* ИСПРАВЛЕНИЕ: pb-[calc(6rem+env(safe-area-inset-bottom))] защищает сайт от нижней полоски айфона */}
      <body className={`${inter.variable} ${playfair.variable} bg-black text-white antialiased pb-[calc(6rem+env(safe-area-inset-bottom))]`}>
        <SplashScreen />
        <Header />
        <main>{children}</main>
        <GlobalPlayer />
      </body>
    </html>
  );
}