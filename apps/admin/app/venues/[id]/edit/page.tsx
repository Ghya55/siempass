import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit page — SiemPass Admin",
  description: "Article editor of a venue.",
};

/* Éditeur de l'article d'un lieu (specs/venues.md, bloc 4) : route posée pour « Edit page »
   (VEN-38), contenu volontairement vide. L'éditeur est la partie 3 sur 3 de specs/venues.md. */
export default function VenueEditorPage() {
  return <main />;
}
