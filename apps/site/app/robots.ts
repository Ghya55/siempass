import type { MetadataRoute } from "next";
import { isProductionDeployment } from "./lib/environment";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://siempass.com/sitemap.xml",
  };
}
