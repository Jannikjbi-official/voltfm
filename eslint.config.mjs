import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored OlyxUI component sources. These are installed verbatim from the
    // OlyxUI registry and deliberately left unmodified, so linting them would
    // only produce warnings we must not "fix".
    "src/components/ui/**",
  ]),
]);

export default eslintConfig;
