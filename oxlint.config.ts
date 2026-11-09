import { defineConfig } from "oxlint";

export default defineConfig({
    // Setting `plugins` overwrites oxlint's default plugin set (eslint, typescript, unicorn, oxc),
    // so the defaults must be listed explicitly alongside the extras we want enabled.
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import"],
    categories: {
        suspicious: "warn",
        perf: "warn"
    },
    rules: {
        "eslint/curly": "warn",
        "eslint/eqeqeq": ["warn", "smart"],
        "eslint/no-var": "warn",
        "eslint/prefer-const": "warn",
        "import/no-duplicates": "warn",
        "typescript/consistent-type-imports": "warn",
        "typescript/no-import-type-side-effects": "error"
    }
});
