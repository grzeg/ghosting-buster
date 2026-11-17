import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Shared flat config. Packages extend it: `export { default } from "@ghosting-buster/config/eslint"`. */
export default tseslint.config(
    { ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/coverage/**"] },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        extends: [tseslint.configs.strictTypeChecked],
        languageOptions: {
            parserOptions: { projectService: true },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/consistent-type-imports": "error",
        },
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);