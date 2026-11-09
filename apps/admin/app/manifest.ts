import type { MetadataRoute } from "next";

// Installable sur le téléphone du partenaire : c'est depuis l'app installée qu'il scannera
// les passes au comptoir. D'où `display: standalone` et une orientation non contrainte,
// le back-office étant desktop-first et l'écran de scan mobile.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SiemPass Admin",
    short_name: "SiemPass Admin",
    description: "Back-office SiemPass : partenaires, offres, ventes, validations.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f6",
    theme_color: "#1b1b1a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
