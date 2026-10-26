/**
 * catalog-import-excel.ts — Parchear export v2 para E2E (usa helper Python del backend).
 *
 * Contexto: delega en `backend/tests/integration/catalog_import_excel_helpers.py`.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(E2E_DIR, "../../../../../backend");
const HELPER_SCRIPT = path.join(
    BACKEND_ROOT,
    "tests/integration/catalog_import_excel_helpers.py"
);

function backendPython(): string {
    const win = path.join(BACKEND_ROOT, "venv/Scripts/python.exe");
    const unix = path.join(BACKEND_ROOT, "venv/bin/python");
    if (fs.existsSync(win)) return win;
    if (fs.existsSync(unix)) return unix;
    throw new Error(
        `E2E catalog import: no se encontró Python en ${win} (¿venv del backend instalado?)`
    );
}

export function nextFreeExerciseIdFromExport(exportXlsxPath: string): number {
    const py = backendPython();
    const out = execFileSync(
        py,
        [
            "-c",
            `import pandas as pd, sys
base = pd.read_excel(sys.argv[1], sheet_name="Ejercicio base")
ids = [int(x) for x in base["exercise_id"].dropna().astype(int)]
print(max(ids) + 1 if ids else 1)`,
            exportXlsxPath,
        ],
        { encoding: "utf-8", cwd: BACKEND_ROOT }
    ).trim();
    return Number.parseInt(out, 10);
}

export function patchExportWithNewExercise(
    inputXlsx: string,
    outputXlsx: string,
    options: {
        newExerciseId: number;
        nombreEs: string;
        nombreEn: string;
        anchorId?: number;
    }
): void {
    const py = backendPython();
    const args = [
        HELPER_SCRIPT,
        inputXlsx,
        outputXlsx,
        "--new-id",
        String(options.newExerciseId),
        "--nombre-es",
        options.nombreEs,
        "--nombre-en",
        options.nombreEn,
    ];
    if (options.anchorId != null) {
        args.push("--anchor-id", String(options.anchorId));
    }
    try {
        execFileSync(py, args, { cwd: BACKEND_ROOT, stdio: "pipe" });
    } catch (error: unknown) {
        const err = error as { stderr?: string; message?: string };
        const detail = err.stderr?.toString() || err.message || String(error);
        throw new Error(`patchExportWithNewExercise failed: ${detail}`);
    }
}

export function patchExportExerciseNames(
    inputXlsx: string,
    outputXlsx: string,
    exerciseId: number,
    nombreEs: string,
    nombreEn: string
): void {
    const py = backendPython();
    execFileSync(
        py,
        [
            HELPER_SCRIPT,
            inputXlsx,
            outputXlsx,
            "--rename-id",
            String(exerciseId),
            "--nombre-es",
            nombreEs,
            "--nombre-en",
            nombreEn,
        ],
        { cwd: BACKEND_ROOT, stdio: "pipe" }
    );
}

export function firstExerciseIdFromExport(exportXlsxPath: string): number {
    const py = backendPython();
    const out = execFileSync(
        py,
        [
            "-c",
            `import pandas as pd, sys
base = pd.read_excel(sys.argv[1], sheet_name="Ejercicio base")
print(int(base.iloc[0]["exercise_id"]))`,
            exportXlsxPath,
        ],
        { encoding: "utf-8", cwd: BACKEND_ROOT }
    ).trim();
    return Number.parseInt(out, 10);
}
