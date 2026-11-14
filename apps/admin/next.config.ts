import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les packages `@siempass/*` sont livrés en TypeScript/CSS source, pas compilés :
  // c'est Next qui les transpile, comme le reste de l'app.
  transpilePackages: [
    "@siempass/core-icons",
    "@siempass/db",
    "@siempass/feature-venue-page",
    "@siempass/site-header",
    "@siempass/tokens",
  ],
};

export default nextConfig;
