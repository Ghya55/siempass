/**
 * `VERCEL_ENV` est posée automatiquement par Vercel : `production`, `preview` ou `development`.
 * Absente en local, où rien n'est indexable de toute façon.
 */
export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}
