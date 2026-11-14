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
  const partenaireFiltre = typeof filtre === "string" && filtre !== "" ? filtre : null;

  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  /* Ordre du tableau : le plus récent d'abord, comme Partners. L'ordre n'est pas spécifié
     (« Ouvert pour Ghya » 9). */
  const requeteLieux = supabase.from("venues").select(COLONNES_DU_LIEU).order("created_at", { ascending: false });
  const [venues, partners] = await Promise.all([
    /* VEN-33 : filtré, la page montre les lieux de ce partenaire et eux seuls. */
    partenaireFiltre === null ? requeteLieux : requeteLieux.eq("partenaire_id", partenaireFiltre),
    /* Les noms des partenaires : colonne « Partner », filtre et liste déroulante de la fiche. */
    supabase
      .from("partners")
      .select("id, contact_prenom, contact_nom")
      .order("contact_prenom", { ascending: true }),
  ]);

  const lieux: Lieu[] = venues.data ?? [];
  const partenaires: PartenaireDuLieu[] = partners.data ?? [];
  const erreur = venues.error ?? partners.error;

  return (
    <VenuesScreen
      adresseConnectee={session.user?.email ?? ""}
      erreurChargement={erreur === null ? null : erreur.message}
      lieux={lieux}
      partenaireFiltre={partenaires.find((partenaire) => partenaire.id === partenaireFiltre) ?? null}
      partenaires={partenaires}
    />
  );
}
