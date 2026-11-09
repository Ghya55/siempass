import type { Metadata, Viewport } from "next";
import "./globals.css";

const THEME_COLOR = "#1b1b1a" as const;

export const metadata: Metadata = {
  title: "SiemPass — back-office",
  description: "Back-office SiemPass : partenaires, offres, ventes, validations.",
  applicationName: "SiemPass Admin",
  // Un back-office ne s'indexe jamais, dans aucun environnement : pas de condition ici.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "SiemPass Admin", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
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
