/**
 * Falla si existe algún .js bajo src/ (artefactos de compilación no deseados junto a .ts).
 * Uso: node scripts/noJsInSrc.mjs
 */
import fs from "fs";
import path from "path";

const root = path.join("src");
const found = [];

function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".js")) found.push(p.split(path.sep).join("/"));
    }
}

if (!fs.existsSync(root)) {
    console.error("lint:no-js-in-src: no existe src/");
    process.exit(1);
}
walk(root);
if (found.length > 0) {
    console.error("lint:no-js-in-src: se encontraron .js en src/ (no permitidos):");
    for (const f of found.sort()) console.error(" ", f);
    process.exit(1);
}
process.exit(0);
