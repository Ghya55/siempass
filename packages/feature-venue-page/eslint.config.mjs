import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Mêmes règles que les deux apps qui consomment ce package.
const eslintConfig = defineConfig([...nextVitals, ...nextTs]);

export default eslintConfig;
