import type { Metadata } from "next";
import { headers } from "next/headers";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { PartnersScreen } from "./partners-screen";
import type { Partenaire } from "./partenaire";

export const metadata: Metadata = {
  title: "Partners — SiemPass Admin",
  description: "Partners of the SiemPass network: add, invite, see their venues.",
};

/* La liste est relue à chaque affichage : après une écriture, `router.refresh()` suffit à faire
   apparaître la donnée, sans rechargement manuel (DEMO-16). */
export const dynamic = "force-dynamic";

/* L'origine de l'admin sert à composer le lien d'accès du partenaire (DEMO-25). Elle est lue
   dans la requête plutôt que devinée : aperçu Vercel, staging et prod n'ont pas le même hôte. */
async function origineDeLaRequete(): Promise<string> {
  const entetes = await headers();
  const hote = entetes.get("x-forwarded-host") ?? entetes.get("host");
  const protocole = entetes.get("x-forwarded-proto") ?? "https";

  return hote === null ? "" : `${protocole}://${hote}`;
}

export default async function PartnersPage() {
  /* Client porteur de la session : depuis la migration 20261110120000, la clé publishable seule
     (rôle `anon`) ne voit que les partenaires « en ligne » et n'écrit rien. Hors session on
     n'arrive pas ici — le proxy redirige vers /login. */
  const supabase = await creerClientAdmin();
  /* `getUser()` et non `getSession()` : la session vient d'un cookie, que le navigateur peut
     écrire ; `getUser()` fait vérifier le jeton par Supabase. */
  const { data: session } = await supabase.auth.getUser();
  const [partners, venues] = await Promise.all([
    supabase.from("partners").select("*").order("created_at", { ascending: false }),
    /* La colonne « Venues » (VEN-15) : le nombre de lieux par partenaire, compté ici plutôt que
       par une jointure imbriquée, dont le typage se tiendrait à la main dans `database.types.ts`. */
    supabase.from("venues").select("partenaire_id"),
  ]);
  const partenaires: Partenaire[] = partners.data ?? [];
  const error = partners.error ?? venues.error;

  return (
    <PartnersScreen
      adresseConnectee={session.user?.email ?? ""}
      erreurChargement={error === null ? null : error.message}
      origineAdmin={await origineDeLaRequete()}
      partenaires={partenaires}
      nombreDeLieux={compterParPartenaire(venues.data ?? [])}
    />
  );
}

function compterParPartenaire(lieux: readonly { partenaire_id: string }[]): Record<string, number> {
  const nombres: Record<string, number> = {};

  for (const { partenaire_id } of lieux) {
    nombres[partenaire_id] = (nombres[partenaire_id] ?? 0) + 1;
  }

  return nombres;
}
