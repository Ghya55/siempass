import type { Metadata, Viewport } from "next";
import { isProductionDeployment } from "./lib/environment";
import "./globals.css";

const THEME_COLOR = "#1b1b1a" as const;

export const metadata: Metadata = {
  title: "SiemPass",
  description: "Le pass des bons plans de Siem Reap.",
  applicationName: "SiemPass",
  appleWebApp: { capable: true, title: "SiemPass", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
  // Hors production, le site ne doit pas être indexé : staging et les aperçus de PR servent
  // le même contenu que siempass.com. Piloté par VERCEL_ENV, jamais figé dans le code.
  robots: isProductionDeployment() ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
