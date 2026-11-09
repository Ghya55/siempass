import { redirect } from "next/navigation";

/* Le back-office n'a qu'un écran au MVP : la racine mène aux partenaires. La page de socle
   (sonde de connexion Supabase) vit désormais sous /socle. */
export default function HomePage() {
  redirect("/partners");
}
