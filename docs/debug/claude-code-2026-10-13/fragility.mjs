/**
 * fragility.mjs
 * Proposito: generar el mapa de fragilidad (RM-24) en Markdown por stdout.
 * Contexto: auditoria debug/claude-code-2026-10-13; uso: node fragility.mjs <raiz-worktree-frontend>.
 * Notas: solo lectura; recorre apps/web/src y packages/shared/src; usa git log de los ultimos 90 dias.
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename, extname } from "node:path";

const root = process.argv[2];
const scopes = ["apps/web/src", "packages/shared/src"];
const exts = new Set([".ts", ".tsx"]);
const isTest = (p) => /\.(test|spec)\.tsx?$/.test(p) || p.includes("__tests__");

function walk(dir, out) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === "dist") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (exts.has(extname(p))) out.push(p);
  }
  return out;
}

const files = scopes.flatMap((s) => walk(join(root, s), []));
const rel = (p) => relative(root, p).replaceAll("\\", "/");

const log = execSync(`git -C "${root}" log --since="90 days ago" --name-only --format=`, { encoding: "utf8", maxBuffer: 1 << 28 });
const commits = new Map();
for (const l of log.split("\n")) { const t = l.trim(); if (t) commits.set(t, (commits.get(t) ?? 0) + 1); }

const tests = files.filter((f) => isTest(rel(f)));
const testSrc = tests.map((t) => ({ path: rel(t), src: readFileSync(t, "utf8") }));
const stem = (p) => basename(p).replace(/\.(test|spec)?\.?tsx?$/, "").replace(/\.(test|spec)$/, "");

const rows = [];
for (const f of files) {
  const r = rel(f);
  if (isTest(r)) continue;
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n").length;
  const s = basename(r).replace(/\.tsx?$/, "");
  const direct = testSrc.filter((t) => stem(t.path) === s || new RegExp(`from ["'][^"']*/${s}["']`).test(t.src)).map((t) => t.path);
  const eff = (src.match(/\buse(Layout)?Effect\s*\(/g) ?? []).length;
  const mut = (src.match(/\buse\w+Mutation\b/g) ?? []).length;
  const io = (src.match(/\b(localStorage|sessionStorage|indexedDB|navigator\.onLine|addEventListener|setTimeout|setInterval|BroadcastChannel)\b/g) ?? []).length;
  const refs = (src.match(/\buseRef\s*[<(]/g) ?? []).length;
  rows.push({ r, lines, c90: commits.get(r) ?? 0, direct, eff, mut, io, refs });
}

rows.sort((a, b) => b.lines - a.lines);
const score = (x) => x.lines / 100 + x.c90 + x.eff * 2 + x.mut + x.io + (x.direct.length ? 0 : 5);
const big = rows.filter((x) => x.lines > 600);
const top = [...rows].sort((a, b) => score(b) - score(a)).slice(0, 30);

const fmt = (x) => `| ${x.lines > 600 ? "**>600** " : ""}\`${x.r}\` | ${x.lines} | ${x.c90} | ${x.direct.length ? "si (" + x.direct.length + ")" : "no"} | ${x.eff} | ${x.mut} | ${x.io} | ${x.refs} |`;
const head = "| Archivo | Lineas | Commits 90d | Test directo | useEffect | Mutations | IO/timers/eventos | useRef |\n|---|---:|---:|---|---:|---:|---:|---:|";

let md = "";
md += `## Resumen\n\n- Archivos analizados (sin tests): ${rows.length}\n- Archivos de test: ${tests.length}\n- Archivos > 600 lineas: ${big.length}\n- Archivos sin test directo: ${rows.filter((x) => !x.direct.length).length}\n\n`;
md += `## Archivos de mas de 600 lineas\n\n${head}\n${big.map(fmt).join("\n")}\n\n`;
md += `## Top 30 por indice de fragilidad\n\nIndice = lineas/100 + commits90d + 2*useEffect + mutations + IO + 5 si no hay test directo.\n\n${head}\n${top.map(fmt).join("\n")}\n\n`;
md += `## Inventario completo (ordenado por lineas)\n\n${head}\n${rows.map(fmt).join("\n")}\n`;
process.stdout.write(md);
