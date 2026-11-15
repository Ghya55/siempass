import { Image as ImageIcon } from "lucide-react";
import styles from "./composants.module.css";

/**
 * Composant Figma `PhotoThumb` (18:497) : la vignette de la photo du lieu, ou le visuel de
 * remplacement neutre quand le partenaire n'en a pas (PART-10).
 */
export function PhotoThumb() {
  return (
    <div className={styles.photoThumb}>
      <ImageIcon size={24} />
    </div>
  );
}
