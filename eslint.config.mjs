import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // La couche API est la frontière avec f1api.dev : c'est là que `any`
    // faisait le plus de dégâts (un champ mal orthographié passait
    // inaperçu). Elle est désormais typée d'après les fixtures réelles
    // (`lib/api/types.ts`), et la règle est réactivée ici pour que ça le
    // reste. Les tests gardent leurs stubs libres.
    files: ["lib/api/**/*.ts"],
    ignores: ["lib/api/**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  globalIgnores([".next/**", "node_modules/**"]),
]);

export default eslintConfig;
