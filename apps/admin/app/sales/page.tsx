import type { Metadata } from "next";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { SalesScreen } from "./sales-screen";
import { statutDeLaVente, type VenteAffichee } from "./vente";

export const metadata: Metadata = {
  title: "Sales — SiemPass Admin",
  description: "Passes sold: when, which pass, and where they were used.",
};

/** La liste se lit à chaque affichage : un pass peut être acheté ou validé entre deux chargements (PASS-9). */
export const dynamic = "force-dynamic";

/* PASS-1 : lecture seule. Aucune action de cette page n'écrit dans la base (PASS-17). */
export default async function SalesPage() {
  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  const [ventes, partenaires, offres] = await Promise.all([
    /* PASS-2 : toutes les ventes, du plus récent au plus ancien. */
    supabase.from("passes").select("*").order("created_at", { ascending: false }),
    /* Les noms de lieux, pour ne pas afficher l'UUID du partenaire validateur. Deux requêtes
       plutôt qu'une jointure imbriquée : le nombre de partenaires est petit, et le typage d'une
       relation imbriquée se tient à la main dans `database.types.ts`. */
    supabase.from("partners").select("id, lieu_nom"),
    /* PASS-21 : le nom actuel du pass du catalogue ; renommer un pass renomme ses ventes. */
    supabase.from("pass_offers").select("id, nom"),
  ]);

  const lieuxParId = new Map((partenaires.data ?? []).map(({ id, lieu_nom }) => [id, lieu_nom]));
  const passesParId = new Map((offres.data ?? []).map(({ id, nom }) => [id, nom]));
  const affichees: VenteAffichee[] = (ventes.data ?? []).map((vente) => ({
    ...vente,
    nomDuPass: vente.offre_id === null ? null : (passesParId.get(vente.offre_id) ?? null),
    lieuValidation: vente.utilise_par === null ? null : (lieuxParId.get(vente.utilise_par) ?? null),
    statut: statutDeLaVente(vente),
  }));

  const erreur = ventes.error ?? partenaires.error ?? offres.error;

  /* PASS-11 : jamais le message de la base à l'écran ; le détail va dans les logs du serveur. */
  if (erreur !== null) {
    console.error("Lecture refusée — liste des ventes", erreur);
  }

  return (
    <SalesScreen adresseConnectee={session.user?.email ?? ""} chargementEchoue={erreur !== null} ventes={affichees} />
  );
}
