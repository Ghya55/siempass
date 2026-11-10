import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign in — SiemPass Admin",
  description: "Sign in to the SiemPass back-office.",
  robots: { index: false, follow: false },
};

/**
 * Écran de connexion du back-office (decisions/2026-11-10-authentification.md).
 *
 * Aucune inscription, aucun lien de récupération : les comptes sont créés par le seed, sur des
 * adresses factices en @siempass.com. Un visiteur qui n'a pas de compte n'a rien à faire ici, et
 * l'écran ne lui propose rien.
 */
export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.carte}>
        <header className={styles.entete}>
          <span className={styles.marque}>SiemPass</span>
          <h1 className={styles.titre}>Back-office</h1>
          <p className={styles.sousTitre}>Sign in to manage partners.</p>
        </header>
        <LoginForm />
      </section>
    </main>
  );
}
