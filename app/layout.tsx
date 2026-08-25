import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desvío — el vuelo raro, más barato",
  description:
    "Busca de cualquier aeropuerto a cualquier otro: directo, escala más barata, tarifa error y ciudad oculta. Maletas y asiento incluidos en el total.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
