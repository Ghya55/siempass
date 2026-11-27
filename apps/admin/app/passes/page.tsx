import type { Metadata } from "next";
import { jourCourant } from "../lib/dates";
import { creerClientAdmin } from "../lib/supabase-serveur";
import type { Offre } from "./offre";
import { PassesScreen } from "./passes-screen";

export const metadata: Metadata = {
  title: "Passes — SiemPass Admin",
  description: "The pass catalogue: compose, publish, take back to draft.",
};

/* Le catalogue est relu à chaque affichage : après un enregistrement, `router.refresh()` suffit. */
export const dynamic = "force-dynamic";

export default async function PassesPage() {
  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  /* Cinq lectures plutôt que des jointures imbriquées : quelques dizaines de passes (bloc 1), et
     le typage d'une relation imbriquée se tient à la main dans `database.types.ts`. */
  const [offres, listesLieux, listesEvenements, lieux, evenements] = await Promise.all([
    /* CAT-2 : du plus récent au plus ancien. */
    supabase.from("pass_offers").select("*").order("created_at", { ascending: false }),
    supabase.from("pass_offer_venues").select("offre_id, lieu_id"),
    supabase.from("pass_offer_events").select("offre_id, evenement_id"),
    /* CAT-7 : tous les lieux, brouillons compris, par nom. */
    supabase.from("venues").select("id, nom, etat").order("nom", { ascending: true }),
    /* CAT-8 : tous les événements, dans l'ordre de la page Events (la date la plus lointaine en tête). */
    supabase
      .from("events")
      .select("id, nom, jour")
      .order("jour", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const erreur = offres.error ?? listesLieux.error ?? listesEvenements.error ?? lieux.error ?? evenements.error;

  if (erreur !== null) {
    console.error("Lecture refusée — catalogue des passes", erreur);
  }

  const catalogue: Offre[] = (offres.data ?? []).map((offre) => ({
    ...offre,
    lieux: (listesLieux.data ?? []).filter((ligne) => ligne.offre_id === offre.id).map((ligne) => ligne.lieu_id),
    evenements: (listesEvenements.data ?? [])
      .filter((ligne) => ligne.offre_id === offre.id)
      .map((ligne) => ligne.evenement_id),
  }));

  return (
    <PassesScreen
      adresseConnectee={session.user?.email ?? ""}
      aujourdhui={jourCourant(new Date())}
      chargementEchoue={erreur !== null}
      choix={{ lieux: lieux.data ?? [], evenements: evenements.data ?? [] }}
      offres={catalogue}
    />
  );
}
