#!/usr/bin/env node
/**
 * Ratchet de longitud de archivos — baseline solo baja (B3 / agent.md §7.1).
 * Uso: node scripts/check-file-length.mjs [--update-baseline]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const baselinePath = path.join(__dirname, "file-length-baseline.json");

const DEFAULT_TEST_MAX = 800;

/** @type {{ defaultMaxLines: number, testMaxLines: number, files: Record<string, number> }} */
function loadBaseline() {
    const raw = fs.readFileSync(baselinePath, "utf8");
    return JSON.parse(raw);
}

function countLines(absPath) {
    const text = fs.readFileSync(absPath, "utf8");
    return text.split(/\r\n|\n|\r/).length;
}

function relFromFrontend(absPath) {
    return path.relative(frontendRoot, absPath).replace(/\\/g, "/");
}

const updateBaseline = process.argv.includes("--update-baseline");
const baseline = loadBaseline();
const violations = [];
const measured = {};

for (const [rel, maxLines] of Object.entries(baseline.files)) {
    const abs = path.join(frontendRoot, rel);
    if (!fs.existsSync(abs)) {
        violations.push(`${rel}: missing (baseline ${maxLines})`);
        continue;
    }
    const lines = countLines(abs);
    measured[rel] = lines;
    if (lines > maxLines) {
        violations.push(`${rel}: ${lines} lines (baseline ratchet ${maxLines})`);
    }
}

if (updateBaseline) {
    const next = { ...baseline, files: { ...baseline.files } };
    for (const [rel, lines] of Object.entries(measured)) {
        if (next.files[rel] == null || lines < next.files[rel]) {
            next.files[rel] = lines;
        }
    }
    fs.writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    console.log("Baseline updated (only decreased entries).");
    process.exit(0);
}

if (violations.length > 0) {
    console.error("check-file-length: FAIL\n" + violations.join("\n"));
    process.exit(1);
}

console.log("check-file-length: OK");
process.exit(0);
