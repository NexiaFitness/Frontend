import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.spec.ts"],
    },
    resolve: {
        alias: {
            "@nexia/shared": path.resolve(__dirname, "src"),
        },
    },
});
