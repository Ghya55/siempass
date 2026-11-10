import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@siempass/db";
import type { Database, SiemPassSupabaseClient } from "@siempass/db";

/**
 * Client Supabase du back-office : même clé publishable que `createSupabaseClient`, mais porteur
 * de la session de l'utilisateur, lue dans les cookies de la requête.
 *
 * C'est ce qui sépare les deux rôles depuis la migration 20261110120000 : sans session, la clé
 * n'ouvre que les partenaires « en ligne » en lecture (`anon`) ; avec elle, l'appelant est
 * `authenticated` et la table entière s'ouvre, en lecture comme en écriture.
 *
 * Un client par appel, sans singleton : un singleton de module partagerait une session entre deux
 * requêtes de deux visiteurs (même raison que dans `packages/db`).
 */
export async function creerClientAdmin(): Promise<SiemPassSupabaseClient> {
  const cookiesDeLaRequete = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookiesDeLaRequete.getAll(),
      setAll: (aPoser) => {
        try {
          for (const { name, value, options } of aPoser) {
            cookiesDeLaRequete.set(name, value, options);
          }
        } catch {
          /* Un composant serveur ne peut pas écrire de cookie : seuls une action serveur et le
             proxy le peuvent. Le rafraîchissement de session a lieu dans `proxy.ts`, à chaque
             requête ; ignorer ici est le motif prescrit par @supabase/ssr. */
        }
      },
    },
  });
}
