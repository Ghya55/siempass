import { Button } from "./Button";
import styles from "./Hero.module.css";

/**
 * Bloc `hero` du Figma (7:616 sur « 08 · Lieux », 7:586 sur « 08.0 »), identique sur les deux
 * écrans. Mise en page, pas un composant Figma : il n'en porte pas le nom dans la bibliothèque.
 * Les textes sont ceux du Figma, au mot près (DEMO-27 : l'interface est en anglais).
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Siem Reap, in your pocket</p>
      <h1 className={styles.title}>One pass, perks at the best spots in town.</h1>
      <p className={styles.subtitle}>
        A drink, a meal, a discount: just show your pass at the counter.
      </p>
      <Button label="Get the pass · $20" href="/buy" size="lg" className={styles.cta} />
    </section>
  );
}
