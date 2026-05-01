import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${playfair.variable} bg-black text-white antialiased pb-24`}>
        <SplashScreen />
        <Header />
        <main>{children}</main>
        <GlobalPlayer />
      </body>
    </html>
  );
}