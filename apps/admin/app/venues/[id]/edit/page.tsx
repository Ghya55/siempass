import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SiemPassSupabaseClient } from "@siempass/db";
import { creerClientAdmin } from "../../../lib/supabase-serveur";
import { EDITOR_COLUMNS, initialArticle } from "./article";
import { VenueEditorScreen } from "./venue-editor-screen";

export const metadata: Metadata = {
  title: "Edit page — SiemPass Admin",
};

/* Relue à chaque ouverture : l'éditeur part de la fiche enregistrée (VEN-30). */
export const dynamic = "force-dynamic";

/**
 * Fraunces et Inter, chargées comme sur le site (apps/site/app/layout.tsx) : la preview doit
 * avoir la typographie de la fiche publique (VEN-12). Seulement sur cette route, le reste du
 * back-office n'en a pas encore.
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,600,0,1&family=Inter:wght@400;500;600&display=swap";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type VenueEditorRouteProps = {
  readonly params: Promise<{ readonly id: string }>;
};

/** `/venues/<id>/edit` : ouverte par « Edit page » depuis la fiche du lieu (VEN-37). */
export default async function VenueEditorRoute({ params }: VenueEditorRouteProps) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }

  const supabase = await creerClientAdmin();
  const { data: session } = await supabase.auth.getUser();
  const { data: venue, error } = await supabase.from("venues").select(EDITOR_COLUMNS).eq("id", id).maybeSingle();

  if (error !== null) {
    throw new Error(`Lecture du lieu ${id} : ${error.message}`);
  }
  if (venue === null) {
    notFound();
  }
  const author = await fetchAuthorFirstName(supabase, venue.auteur_id);

  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} precedence="default" />
      <VenueEditorScreen
        venue={venue}
        author={author}
        initialArticle={initialArticle(venue)}
        signedInEmail={session.user?.email ?? ""}
      />
    </>
  );
}

/**
 * VEN-9 : le prénom porté par le compte auteur, pour « Written by » dans la preview. Nul pour un
 * lieu repris (VEN-27) ou un compte sans prénom : comme sur le site, pas de ligne.
 */
async function fetchAuthorFirstName(
  supabase: SiemPassSupabaseClient,
  authorId: string | null,
): Promise<string | null> {
  if (authorId === null) {
    return null;
  }
  const { data, error } = await supabase.from("profiles").select("prenom").eq("id", authorId).maybeSingle();
  if (error !== null) {
    throw new Error(`Lecture du prénom de l'auteur ${authorId} : ${error.message}`);
  }
  return data?.prenom ?? null;
}
