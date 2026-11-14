// Next.js déclare ce type pour les apps (next-env.d.ts) ; le package, vérifié seul, le déclare ici.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
