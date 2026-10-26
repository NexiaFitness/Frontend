/**
 * global-setup.ts — Aviso previo a la suite E2E y carga de credenciales QA.
 *
 * Contexto: Playwright no hereda `backend/.env.qa`; se mapea a NEXIA_QA_* para
 * specs admin (qa.md §8).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const QA_ENV_PATH = path.resolve(E2E_DIR, "../../../../backend/.env.qa");

function loadQaEnvFile(): void {
    if (!fs.existsSync(QA_ENV_PATH)) {
        return;
    }
    const raw = fs.readFileSync(QA_ENV_PATH, "utf8");
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const eq = trimmed.indexOf("=");
        if (eq <= 0) {
            continue;
        }
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined || process.env[key] === "") {
            process.env[key] = value;
        }
    }
    if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim() && process.env.DEMO_ADMIN_PASSWORD) {
        process.env.NEXIA_QA_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;
    }
    if (!process.env.NEXIA_QA_ADMIN_EMAIL?.trim() && process.env.DEMO_ADMIN_EMAIL) {
        process.env.NEXIA_QA_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL;
    }
}

async function globalSetup() {
    loadQaEnvFile();
    console.log("[E2E] Asegúrate de que el backend corre con .env.e2e (base nexia_e2e).");
    console.log("[E2E] Para resetear la base: bash backend/scripts/reset_e2e_db.sh (Git Bash o WSL).");
    if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
        console.warn(
            "[E2E] Sin NEXIA_QA_ADMIN_PASSWORD: copia backend/.env.qa desde .env.qa.example"
        );
    }
}

export default globalSetup;
