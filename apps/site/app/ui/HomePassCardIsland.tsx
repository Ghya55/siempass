"use client";

import { useBrowserPass } from "@/app/lib/browser-pass";
import { HomePassCard } from "./HomePassCard";

/**
 * L'îlot client de l'accueil : la seule chose de la page qui attende le navigateur. La liste
 * des lieux reste rendue côté serveur, au-dessous, et ne dépend pas de cette réponse.
 */
export function HomePassCardIsland() {
  const pass = useBrowserPass();

  if (pass.status === "reading") {
    return <HomePassCard state="loading" />;
  }
  if (pass.status === "noPass") {
    return <HomePassCard state="noPass" />;
  }
  return <HomePassCard state="hasPass" code={pass.code} validUntil={pass.validUntil} />;
}
