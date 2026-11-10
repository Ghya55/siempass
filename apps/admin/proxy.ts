import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Database } from "@siempass/db";
import { CHEMIN_APRES_CONNEXION, CHEMIN_CONNEXION } from "@/app/lib/chemins";

/**
 * Protection du back-office : hors session, toute route mène à l'écran de connexion
 * (decisions/2026-11-10-authentification.md).
 *
 * Nommé `proxy.ts` et non `middleware.ts` : c'est le nom de la chose depuis Next 16, l'ancien
 * n'est gardé que par compatibilité.
 *
 * Deux rôles dans un seul passage : rafraîchir la session (le jeton d'accès expire en une heure,
 * seuls le proxy et une action serveur peuvent réécrire le cookie) et refuser l'accès.
 *
 * Ce qui reste ouvert, et pourquoi :
 *   `/login`  l'écran de connexion lui-même ;
 *   `/p/…`    l'espace partenaire — son jeton opaque tient lieu de connexion (PART-7), et la
 *             décision du 10/11 ne change rien pour le partenaire. Exclu par le `matcher`
 *             ci-dessous : le proxy n'y tourne pas du tout.
 */
export async function proxy(requete: NextRequest): Promise<NextResponse> {
  /* Réaffectée par `setAll` quand Supabase renouvelle la session : la réponse doit alors être
     reconstruite depuis la requête, cookies renouvelés compris. */
  let reponse = NextResponse.next({ request: requete });

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => requete.cookies.getAll(),
      setAll: (aPoser) => {
        for (const { name, value } of aPoser) {
          requete.cookies.set(name, value);
        }
        reponse = NextResponse.next({ request: requete });
        for (const { name, value, options } of aPoser) {
          reponse.cookies.set(name, value, options);
        }
      },
    },
  });

  /* `getUser()` et non `getSession()` : la session vient d'un cookie, que le navigateur peut
     écrire ; `getUser()` fait vérifier le jeton par Supabase. */
  const { data } = await supabase.auth.getUser();
  const connecte = data.user !== null;
  const surEcranDeConnexion = requete.nextUrl.pathname === CHEMIN_CONNEXION;

  if (!connecte && !surEcranDeConnexion) {
    /* Pas de paramètre de retour : le back-office n'a qu'un écran, la connexion y mène. */
    return NextResponse.redirect(nouvelleUrl(requete, CHEMIN_CONNEXION));
  }

  if (connecte && surEcranDeConnexion) {
    return NextResponse.redirect(nouvelleUrl(requete, CHEMIN_APRES_CONNEXION));
  }

  return reponse;
}

function nouvelleUrl(requete: NextRequest, chemin: string): URL {
  const url = requete.nextUrl.clone();
  url.pathname = chemin;
  url.search = "";

  return url;
}

export const config = {
  /* Tout, sauf : les ressources de Next, l'espace partenaire, et les fichiers servis tels quels
     (icônes, manifeste, robots). Un fichier statique n'a pas de session à rafraîchir. */
  matcher: [
    "/((?!_next/|p/|favicon\\.ico|robots\\.txt|manifest\\.webmanifest|.*\\.(?:png|svg|ico)$).*)",
  ],
};
