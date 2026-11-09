import type { Metadata } from "next";
import { checkSupabaseConnection } from "@siempass/db";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SiemPass — socle",
  description: "Page de socle : état de la connexion à Supabase.",
};

// La vérification est un appel réseau à chaque affichage : rien n'est pré-rendu au build,
// sinon la CI échouerait dès que Supabase est injoignable depuis le runner.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const connection = await checkSupabaseConnection();
  const isConnected = connection.status === "connecte";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>SiemPass — site</h1>
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
