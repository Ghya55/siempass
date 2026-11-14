"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import styles from "./page.module.css";

type ProprietesScanner = {
  readonly jeton: string;
  /** Nom du lieu, affiché sous le titre (`partner` dans Figma 6:105). */
  readonly partner: string;
};

type EtatCamera = "demarrage" | "active" | "indisponible";

/**
 * Écran Figma « 10.1 · Scanner · caméra » (7:515), plein écran mobile.
 *
 * Ce que la caméra lit part dans l'URL de la route de résultat : la caméra n'est qu'une
 * façon de fournir le code, et c'est le serveur qui décide du résultat (DEMO-6). Aucun
 * champ de saisie n'est montré, ni ici ni après le scan (DEMO-7, DEMO-15).
 */
export function ScannerCamera({ jeton, partner }: ProprietesScanner) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [etat, setEtat] = useState<EtatCamera>("demarrage");

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) {
      return;
    }

    let flux: MediaStream | null = null;
    let image = 0;
    let arrete = false;
    const canevas = document.createElement("canvas");
    const contexte = canevas.getContext("2d", { willReadFrequently: true });

    function chercherCode() {
      if (arrete || video === null || contexte === null) {
        return;
      }
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canevas.width = video.videoWidth;
        canevas.height = video.videoHeight;
        contexte.drawImage(video, 0, 0, canevas.width, canevas.height);
        const pixels = contexte.getImageData(0, 0, canevas.width, canevas.height);
        const trouve = jsQR(pixels.data, pixels.width, pixels.height, {
          inversionAttempts: "dontInvert",
        });
        if (trouve !== null && trouve.data !== "") {
          arrete = true;
          router.replace(`/p/${jeton}/scan?code=${encodeURIComponent(trouve.data)}`);
          return;
        }
      }
      image = requestAnimationFrame(chercherCode);
    }

    async function allumer() {
      try {
        flux = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (arrete || video === null) {
          return;
        }
        video.srcObject = flux;
        await video.play();
        setEtat("active");
        image = requestAnimationFrame(chercherCode);
      } catch {
        // Permission refusée, pas de caméra, ou page servie en HTTP : un seul message,
        // celui de DEMO-15. On ne propose jamais de saisir le code à la main.
        setEtat("indisponible");
      }
    }

    void allumer();

    return () => {
      arrete = true;
      cancelAnimationFrame(image);
      flux?.getTracks().forEach((piste) => piste.stop());
    };
  }, [jeton, router]);

  return (
    <div className={styles.scanner}>
      <header className={styles.scannerEntete}>
        <p className={styles.scannerTitre}>Scan a pass</p>
        <p className={styles.scannerLieu}>{partner}</p>
      </header>

      <div className={styles.viseurZone}>
        <video ref={videoRef} className={styles.video} muted playsInline />
        {/* `viewfinder` (6:110), tel que Figma l'exporte : quatre coins et la ligne de visée. */}
        <svg className={styles.viseur} viewBox="0 0 264 264" fill="none" aria-hidden="true">
          <path
            d="M4 56V20C4 15.7565 5.68571 11.6869 8.68629 8.68629C11.6869 5.68571 15.7565 4 20 4H56M208 4H244C248.243 4 252.313 5.68571 255.314 8.68629C258.314 11.6869 260 15.7565 260 20V56M260 208V244C260 248.243 258.314 252.313 255.314 255.314C252.313 258.314 248.243 260 244 260H208M56 260H20C15.7565 260 11.6869 258.314 8.68629 255.314C5.68571 252.313 4 248.243 4 244V208"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M28 132H236" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      {etat === "indisponible" ? (
        // FIGMA-MANQUANT: `ScannerView` (6:105) n'a pas d'état « caméra refusée ». Le texte
        // anglais exact manque donc ; la spec ne donne que le sens (DEMO-15). Attend Alex.
        <p className={styles.scannerConsigne}>Allow the camera to scan a pass</p>
      ) : (
        <p className={styles.scannerConsigne}>Fit the pass QR code inside the frame</p>
      )}
    </div>
  );
}
