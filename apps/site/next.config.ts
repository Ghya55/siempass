import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `@siempass/db` et `@siempass/tokens` sont livrés en TypeScript/CSS source, pas compilés :
  // c'est Next qui les transpile, comme le reste de l'app.
  transpilePackages: ["@siempass/db", "@siempass/tokens"],
};

export default nextConfig;
