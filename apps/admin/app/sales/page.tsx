import type { Metadata } from "next";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { PassesScreen } from "./passes-screen";
import { statutDuPass, type PassAffiche } from "./pass";

export const metadata: Metadata = {
  title: "Passes — SiemPass Admin",
  description: "Passes sold, their status, and the test actions on them.",
};

/** La liste se lit à chaque affichage : un pass peut être validé entre deux chargements. */
export const dynamic = "force-dynamic";

export default async function PassesPage() {
  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();

  const [passes, partenaires] = await Promise.all([
    supabase.from("passes").select("*").order("created_at", { ascending: false }),
    /* Les noms de lieux, pour ne pas afficher l'UUID du partenaire validateur. Deux requêtes
       plutôt qu'une jointure imbriquée : le nombre de partenaires est petit, et le typage d'une
       relation imbriquée se tient à la main dans `database.types.ts`. */
    supabase.from("partners").select("id, lieu_nom"),
  ]);

  const lieuxParId = new Map((partenaires.data ?? []).map(({ id, lieu_nom }) => [id, lieu_nom]));
  const maintenant = new Date();
  const affiches: PassAffiche[] = (passes.data ?? []).map((pass) => ({
    ...pass,
    lieuValidation: pass.utilise_par === null ? null : (lieuxParId.get(pass.utilise_par) ?? null),
    statut: statutDuPass(pass, maintenant),
  }));

  const erreur = passes.error ?? partenaires.error;

  return (
    <PassesScreen
      adresseConnectee={session.user?.email ?? ""}
      erreurChargement={erreur === null ? null : erreur.message}
      passes={affiches}
    />
  );
}
