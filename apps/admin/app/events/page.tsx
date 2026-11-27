import type { Metadata } from "next";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { EventsScreen } from "./events-screen";
import type { EvenementAffiche } from "./evenement";

export const metadata: Metadata = {
  title: "Events — SiemPass Admin",
  description: "Events of the SiemPass network: add, list, edit.",
};

/* La liste est relue à chaque affichage : après un ajout, `router.refresh()` suffit. */
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  const [evenements, lieux] = await Promise.all([
    /* Bloc 2 : par date, la plus lointaine en tête. */
    supabase
      .from("events")
      .select("*")
      .order("jour", { ascending: false })
      .order("created_at", { ascending: false }),
    /* Le choix « Venue » propose tous les lieux, par nom (bloc 3, EVT-11). Deux requêtes plutôt
       qu'une jointure imbriquée : même raison que la page des ventes. */
    supabase.from("venues").select("id, nom").order("nom", { ascending: true }),
  ]);

  const erreur = evenements.error ?? lieux.error;

  if (erreur !== null) {
    console.error("Lecture refusée — liste des événements", erreur);
  }

  const nomsDesLieux = new Map((lieux.data ?? []).map(({ id, nom }) => [id, nom]));
  const affiches: EvenementAffiche[] = (evenements.data ?? []).map((evenement) => ({
    ...evenement,
    lieuNom: nomsDesLieux.get(evenement.lieu_id) ?? "",
  }));

  return (
    <EventsScreen
      adresseConnectee={session.user?.email ?? ""}
      chargementEchoue={erreur !== null}
      evenements={affiches}
      lieux={lieux.data ?? []}
    />
  );
}
