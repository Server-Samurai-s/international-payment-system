import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      'react/no-unknown-property': ['error', { 
        ignore: [
          'args',
          'map',
          'specularMap',
          'shininess',
          'emissiveMap',
          'emissiveIntensity',
          'emissive',
          'transparent',
          'depthWrite',
          'blending',
          'side',
          'intensity',
          'position'
        ] 
      }]
    }
  },
];
