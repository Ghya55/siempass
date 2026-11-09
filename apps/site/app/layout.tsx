import type { Metadata, Viewport } from "next";
import { isProductionDeployment } from "./lib/environment";
import "./globals.css";

const THEME_COLOR = "#fbf7f1" as const;

/**
 * Fraunces et Inter sont les deux familles du Figma (--font-family-display, --font-family-text).
 * Chargées par `<link>` plutôt que par `next/font/google` : `next/font` télécharge la police au
 * build, et le build tourne dans des environnements sans accès à fonts.googleapis.com — la CI
 * et les sessions de l'équipe. Un `<link>` ne coûte rien au build et laisse le navigateur du
 * visiteur chercher la police ; sans elle, les replis de `--font-family-*` prennent la main.
 * À repasser sur `next/font` (auto-hébergement, pas de saut de rendu) quand le build a le réseau.
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,600,0,1&family=Inter:wght@400;500;600&display=swap";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
