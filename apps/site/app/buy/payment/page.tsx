"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acheterPass } from "../_composants/achat";
import { classesBouton } from "../_composants/bouton";
import { SiteHeader } from "../../ui/SiteHeader";
import styles from "./page.module.css";

/** Les trois moyens de paiement montrés (DEMO-28), libellés exacts du Figma 7:687. */
const MOYENS = [
  { id: "khqr", label: "KHQR", detail: "Scan with your banking app" },
  { id: "aba-pay", label: "ABA Pay", detail: "Open the ABA Mobile app" },
  { id: "bank-card", label: "Bank card", detail: "Visa, Mastercard, UnionPay, JCB" },
] as const;

type IdentifiantMoyen = (typeof MOYENS)[number]["id"];

const MOYEN_PAR_DEFAUT: IdentifiantMoyen = "khqr";

/**
 * Figma « 09.2 · Pass · paiement » (7:675).
 *
 * Le moyen choisi ne change rien au chemin : c'est la fonction `acheter-pass` qui décide,
 * avec le fournisseur que lui donne son drapeau d'environnement (DEMO-23, DEMO-26). L'écran
 * montre les trois moyens parce que la démonstration les montre, pas parce qu'il les traite.
 */
export default function PaymentPage() {
  const router = useRouter();
  const [moyen, setMoyen] = useState<IdentifiantMoyen>(MOYEN_PAR_DEFAUT);
  const [enCours, setEnCours] = useState(false);

  async function payer() {
    setEnCours(true);
    const achat = await acheterPass();

    if (achat.resultat === "paye") {
      router.replace(`/pass/${achat.code}`);
      return;
    }
    // DEMO-13 : aucun pass n'a été créé. La raison technique, quand il y en a une, suit
    // l'écran d'échec — un écran qui dit « ça n'a pas marché » sans dire quoi ne sert à rien.
    const raison = achat.resultat === "erreur" ? `?raison=${encodeURIComponent(achat.detail)}` : "";
    router.replace(`/buy/failed${raison}`);
  }

  return (
    <div className={styles.ecran}>
      <SiteHeader />
      <main className={styles.contenu}>
        <h1 className={styles.titre}>Payment</h1>

        <p className={styles.recapitulatif}>
          <span>SiemPass pass</span>
          <span>$20</span>
        </p>

        {/* Le <legend> est masqué à l'œil : le Figma n'affiche pas de titre au-dessus des
            trois moyens, mais un groupe de boutons radio sans intitulé n'est pas lisible au
            lecteur d'écran. Rien ne change visuellement. */}
        <fieldset className={styles.moyens}>
          <legend className={styles.legende}>Payment method</legend>
          {MOYENS.map((option) => (
            <label
              key={option.id}
              className={`${styles.moyen} ${option.id === moyen ? styles.choisi : ""}`}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.id}
                checked={option.id === moyen}
                onChange={() => setMoyen(option.id)}
                className={styles.radio}
              />
              <span className={styles.texte}>
                <span className={styles.label}>{option.label}</span>
                <span className={styles.detail}>{option.detail}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <button
          type="button"
          onClick={payer}
          disabled={enCours}
          className={classesBouton({ tone: "primary", size: "lg", pleineLargeur: true })}
        >
          {/* FIGMA-MANQUANT: l'état « paiement en cours » du bouton n'existe pas dans le
              Figma (7:703). Libellé provisoire, à faire trancher par Alex. */}
          {enCours ? "Paying…" : "Pay $20"}
        </button>

        <p className={styles.securite}>Secure payment by ABA PayWay.</p>
      </main>
    </div>
  );
}
