import type { Metadata } from "next";
import { checkSupabaseConnection } from "@siempass/db";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SiemPass Admin — socle",
  description: "Page de socle : état de la connexion à Supabase.",
};

// Appel réseau à chaque affichage : rien n'est pré-rendu au build (voir apps/site).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const connection = await checkSupabaseConnection();
  const isConnected = connection.status === "connecte";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>SiemPass — back-office</h1>
      <p className={styles.subtitle}>
        Socle technique. Aucun écran produit : le premier arrive après validation du Figma.
      </p>
      <section className={styles.card}>
        <p className={`${styles.verdict} ${isConnected ? styles.connecte : styles.erreur}`}>
          {isConnected ? "Supabase : connecté" : "Supabase : erreur"}
        </p>
        <p className={styles.detail}>{connection.detail}</p>
      </section>
    </main>
  );
}
