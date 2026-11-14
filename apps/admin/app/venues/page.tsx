import type { Metadata } from "next";
import { PARAMETRE_PARTENAIRE } from "../lib/chemins";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { COLONNES_DU_LIEU, type Lieu, type PartenaireDuLieu } from "./lieu";
import { VenuesScreen } from "./venues-screen";

export const metadata: Metadata = {
  title: "Venues — SiemPass Admin",
  description: "Venues of the SiemPass network: create, fill in, publish.",
};

/* Relue à chaque affichage : après une écriture, `router.refresh()` suffit (VEN-29). */
export const dynamic = "force-dynamic";

type VenuesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const parametres = await searchParams;
  const filtre = parametres[PARAMETRE_PARTENAIRE];

  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  /* Ordre du tableau : le plus récent d'abord ; partenaires par prénom (validés par Ghya le
     15/11). */
  const [venues, partners] = await Promise.all([
    supabase.from("venues").select(COLONNES_DU_LIEU).order("created_at", { ascending: false }),
    /* Les noms des partenaires : colonne « Partner », filtre et liste déroulante de la fiche. */
    supabase
      .from("partners")
      .select("id, contact_prenom, contact_nom")
      .order("contact_prenom", { ascending: true }),
  ]);

  const partenaires: PartenaireDuLieu[] = partners.data ?? [];
  /* `?partner=` ne va jamais tel quel à la base : il désigne un partenaire de la liste lue, ou
     rien. Valeur qui n'est pas un identifiant, ou partenaire inconnu : la page sans filtre. */
  const partenaireFiltre = partenaires.find((partenaire) => partenaire.id === filtre) ?? null;
  /* VEN-33 : filtrée, la page montre les lieux de ce partenaire et eux seuls. */
  const lieux: Lieu[] = (venues.data ?? []).filter(
    (lieu) => partenaireFiltre === null || lieu.partenaire_id === partenaireFiltre.id,
  );
  const erreur = venues.error ?? partners.error;

  return (
    <VenuesScreen
      adresseConnectee={session.user?.email ?? ""}
      erreurChargement={erreur === null ? null : erreur.message}
      lieux={lieux}
      partenaireFiltre={partenaireFiltre}
      partenaires={partenaires}
    />
  );
}
