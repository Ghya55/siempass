import type { FC } from "react";
import styles from "./icon-asset.module.css";

/* ASSET-FIGMA-INDISPONIBLE : les SVG du Figma (pin, store, close, photo, check) ne sont pas
   téléchargeables depuis cette session — la sortie réseau vers www.figma.com est refusée par le
   proxy (403). Le skill figma-vers-code prévoit ce cas : placeholder visible et note pour Ghya.
   Chaque icône garde sa géométrie exacte du Figma ; dès que les cinq fichiers sont déposés dans
   `apps/admin/public/icons/<nom>.svg`, il n'y a qu'à remplacer ce <span> par un <img>. */

/* `ticket` n'est pas dans le Figma : il nomme l'entrée « Passes » de la barre latérale, un
   écran de test non maquetté. Il rend le même placeholder que les cinq autres — aucune
   géométrie n'est inventée, il y a juste un nom de plus à fournir le jour de la livraison. */
export type NomIcone = "pin" | "store" | "close" | "photo" | "check" | "ticket";

export type IconProps = {
  name: NomIcone;
  size: number;
};

export const Icon: FC<IconProps> = ({ name, size }) => {
  return (
    <span
      aria-hidden="true"
      className={styles.placeholder}
      data-icone={name}
      style={{ width: size, height: size }}
    />
  );
};
