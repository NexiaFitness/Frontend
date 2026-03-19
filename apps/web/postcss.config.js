/**
 * PostCSS Configuration — Tailwind + Autoprefixer
 *
 * Ruta explícita a tailwind.config.js para evitar fallos de resolución
 * cuando el servidor se ejecuta desde distintas raíces (monorepo).
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: {
      config: path.resolve(__dirname, "tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
