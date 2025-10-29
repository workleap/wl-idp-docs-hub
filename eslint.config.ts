import { defineCoreConfig, definePackageJsonConfig, defineYamlConfig } from "@workleap/eslint-configs";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "docs"
    ]),
    defineCoreConfig(),
    definePackageJsonConfig(),
    defineYamlConfig()
]);
