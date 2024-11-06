import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
      sourceType: "module",
    },
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Custom rules specific to your backend
    },
  },
];
