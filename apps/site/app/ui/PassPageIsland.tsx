"use client";

import { useBrowserPass, type BrowserPass } from "@/app/lib/browser-pass";
import { QrCode } from "@/app/pass/[code]/_composants/qr-code";
import { Button } from "./Button";
import { PassCard } from "./PassCard";
import { PassPitch } from "./PassPitch";
import { PaymentSheet } from "./PaymentSheet";
import { usePassPurchase } from "./use-pass-purchase";
import styles from "./PassPageIsland.module.css";

/** Libellé exact du Figma (I71:200;68:48) et de la spec (bloc 2). */
const ACHETER = "Get the Pass" as const;

/** Côté du QR dans le gabarit `qrCode` du Figma (5:73). */
const TAILLE_QR = 200 as const;

/**
 * Le corps de la page `/pass` : ses deux états, et la feuille de paiement par-dessus.
 *
 * Les deux états viennent du même `useBrowserPass` que l'accueil — une seule question « ai-je
 * un pass ? », posée une seule fois (VIS-2). La feuille vit à côté du corps, et non dedans :
 * elle doit pouvoir finir de redescendre alors que le corps est déjà passé au pass (VIS-9).
 */
export function PassPageIsland() {
  const { pass, adoptPass } = useBrowserPass();
  const achat = usePassPurchase({ onPaid: adoptPass });

  return (
    <>
      <PassPageBody pass={pass} onBuy={achat.openSheet} />
      <PaymentSheet
        open={achat.isSheetOpen}
        busy={achat.isPaying}
        failure={achat.failure}
        onPay={achat.pay}
        onClose={achat.closeSheet}
      />
    </>
  );
}

type PassPageBodyProps = {
  readonly pass: BrowserPass;
  readonly onBuy: () => void;
};

function PassPageBody({ pass, onBuy }: PassPageBodyProps) {
  if (pass.status === "hasPass") {
    return <PassStage code={pass.code} validUntil={pass.validUntil} />;
  }
  if (pass.status === "noPass") {
    return <PitchStage onBuy={onBuy} />;
  }
  // FIGMA-MANQUANT: la page pass n'a pas de cadre « en lecture » — l'accueil, lui, en a un
  // (73:117). La page garde donc son en-tête et laisse son corps vide le temps de la réponse,
  // plutôt que de montrer un argumentaire qui basculerait aussitôt sur le pass. Rien ne saute
  // quand la réponse arrive : la place est déjà prise (VIS-31, VIS-34).
  return <div className={styles.waiting} aria-hidden="true" />;
}

/** Figma « 11 · Pass · argumentaire » (57:197) : la bande, puis le bloc `action` (71:199). */
function PitchStage({ onBuy }: Pick<PassPageBodyProps, "onBuy">) {
  return (
    <main className={styles.pitchStage}>
      <PassPitch />
      <div className={styles.action}>
        {/* VIS-29 : l'élément le plus voyant de la page. VIS-8 : il ouvre la feuille, il ne
            mène nulle part — l'adresse de la page ne change pas. */}
        <Button label={ACHETER} size="xl" tone="primary" hasIcon fullWidth onClick={onBuy} />
      </div>
    </main>
  );
}

type PassStageProps = { readonly code: string; readonly validUntil: string };

/** Figma « 11.1 · Pass · le pass » (57:321) : le bloc `body` (71:496) et sa carte. */
function PassStage({ code, validUntil }: PassStageProps) {
  return (
    <main className={styles.stage}>
      {/* VIS-7 : le seul endroit du site où le QR réel existe. */}
      <PassCard
        code={code}
        validUntil={validUntil}
        qrCode={<QrCode valeur={code} taille={TAILLE_QR} />}
      />
    </main>
  );
}
