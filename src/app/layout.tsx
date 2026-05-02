import type { Metadata, Viewport } from "next";
import { 
  Playfair_Display, 
  Inter, 
  Unbounded, 
  Russo_One, 
  Jura, 
  Philosopher, 
  Caveat, 
  Pacifico, 
  Amatic_SC, 
  Comfortaa 
} from "next/font/google";
import "./globals.css";

import Header from "../components/layout/Header";
import GlobalPlayer from "../components/layout/GlobalPlayer";
import SplashScreen from "../components/layout/SplashScreen";

// === БАЗОВЫЕ ===
const playfair = Playfair_Display({ subsets:["latin", "cyrillic"], variable: "--font-playfair" });
const inter = Inter({ subsets:["latin", "cyrillic"], variable: "--font-inter" });

// === СТИЛЬ И ДЕРЗОСТЬ ===
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded" });
const russo = Russo_One({ weight: "400", subsets:["latin", "cyrillic"], variable: "--font-russo" });
const jura = Jura({ subsets:["latin", "cyrillic"], variable: "--font-jura" });
const philosopher = Philosopher({ weight:["400", "700"], subsets: ["latin", "cyrillic"], variable: "--font-philosopher" });

// === МИЛОТА И ЭСТЕТИКА ===
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-caveat" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin", "cyrillic"], variable: "--font-pacifico" });
const amatic = Amatic_SC({ weight:["400", "700"], subsets: ["latin", "cyrillic"], variable: "--font-amatic" });
const comfortaa = Comfortaa({ subsets: ["latin", "cyrillic"], variable: "--font-comfortaa" });

export const metadata: Metadata = {
  title: "ОПУСТОШАТЕЛИ | Закрытый клуб",
  description: "Официальный сайт. Саморазвитие, бизнес, музыка и стиль жизни.",
};

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
      <body className={`
        ${inter.variable} ${playfair.variable} 
        ${unbounded.variable} ${russo.variable} ${jura.variable} ${philosopher.variable}
        ${caveat.variable} ${pacifico.variable} ${amatic.variable} ${comfortaa.variable}
        bg-black text-white antialiased pb-[calc(6rem+env(safe-area-inset-bottom))]
      `}>
        <SplashScreen />
        <Header />
        <main>{children}</main>
        <GlobalPlayer />
      </body>
    </html>
  );
}