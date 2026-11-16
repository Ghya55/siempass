import type { Metadata } from "next";
import { creerClientAdmin } from "../lib/supabase-serveur";
import { ArtistsScreen } from "./artists-screen";

export const metadata: Metadata = {
  title: "Artists — SiemPass Admin",
  description: "Artists of the SiemPass network: add, list.",
};

/* La liste est relue à chaque affichage : après un ajout, `router.refresh()` suffit. */
export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error !== null) {
    console.error("Lecture refusée — liste des artistes", error);
  }

  return (
    <ArtistsScreen
      adresseConnectee={session.user?.email ?? ""}
      artistes={data ?? []}
      chargementEchoue={error !== null}
    />
  );
}
